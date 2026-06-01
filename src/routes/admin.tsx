import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Trash2, Plus, LogOut, Upload, Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Quote, Code, Eye,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { adminNewsQueryOptions, isAdminQueryOptions } from "@/lib/news.queries";
import { upsertNews, deleteNews } from "@/lib/news.functions";
import { BlocksEditor } from "@/components/BlocksEditor";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — LivingLab Sicani" }] }),
  component: AdminPage,
});

type Editing = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  cover_url: string;
  published_at: string;
} | null;

function AdminPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [hasSession, setHasSession] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      setHasSession(!error && !!data.user);
      setAuthResolved(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setHasSession(!!s);
      setAuthResolved(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authResolved && !hasSession) nav({ to: "/login", replace: true });
  }, [authResolved, hasSession, nav]);

  const isAdminQ = useQuery({ ...isAdminQueryOptions, enabled: hasSession, retry: false });
  const newsQ = useQuery({ ...adminNewsQueryOptions, enabled: isAdminQ.data?.isAdmin === true, retry: false });
  const upsertFn = useServerFn(upsertNews);
  const deleteFn = useServerFn(deleteNews);
  const [editing, setEditing] = useState<Editing>(null);
  const [tab, setTab] = useState<"news" | "blocks">("news");

  const upsertM = useMutation({
    mutationFn: upsertFn,
    onSuccess: () => {
      toast.success("Notizia salvata");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Errore"),
  });

  const deleteM = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      toast.success("Notizia eliminata");
      qc.invalidateQueries({ queryKey: ["news"] });
    },
  });

  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/login" });
  }

  if (!authResolved || !hasSession || (hasSession && isAdminQ.isPending)) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center text-ink-muted">Caricamento…</div>
      </div>
    );
  }

  if (!isAdminQ.data?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-semibold mb-3">Accesso non autorizzato</h1>
          <p className="text-ink-muted mb-8">Il tuo account non dispone dei permessi necessari. Contatta l'amministratore del sito.</p>
          <button onClick={logout} className="text-sm text-accent hover:underline">Disconnetti</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Pannello admin</h1>
          <button onClick={logout} className="text-sm text-ink-muted hover:text-foreground px-3 inline-flex items-center gap-2">
            <LogOut size={14} /> Esci
          </button>
        </div>

        <div className="flex gap-2 mb-8 border-b border-foreground/10">
          {[
            { id: "news" as const, label: "Notizie" },
            { id: "blocks" as const, label: "Sezioni & immagini" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setEditing(null); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-accent text-foreground" : "border-transparent text-ink-muted hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "blocks" ? (
          <BlocksEditor />
        ) : (
        <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Notizie</h2>
          <button
            onClick={() => setEditing({ slug: "", title: "", excerpt: "", body: "", category: "Notizie", cover_url: "", published_at: new Date().toISOString().slice(0, 16) })}
            className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-xl inline-flex items-center gap-2"
          >
            <Plus size={16} /> Nuova
          </button>
        </div>

        {editing ? (
          <EditForm
            editing={editing}
            onCancel={() => setEditing(null)}
            onSave={(v) => upsertM.mutate({ data: v })}
            saving={upsertM.isPending}
          />
        ) : (
          <div className="bg-surface rounded-3xl ring-1 ring-foreground/5 divide-y divide-foreground/5">
            {(newsQ.data ?? []).map((n) => (
              <div key={n.id} className="p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">{n.category}</span>
                    <span className="text-[11px] text-ink-muted">
                      {n.published_at ? new Date(n.published_at).toLocaleDateString("it-IT") : "Bozza"}
                    </span>
                  </div>
                  <div className="font-medium truncate">{n.title}</div>
                </div>
                <button onClick={() => setEditing({
                  id: n.id, slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body,
                  category: n.category, cover_url: n.cover_url ?? "",
                  published_at: n.published_at ? n.published_at.slice(0, 16) : "",
                })} className="text-sm text-accent hover:underline">Modifica</button>
                <button onClick={() => { if (confirm("Eliminare?")) deleteM.mutate({ data: { id: n.id } }); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(newsQ.data ?? []).length === 0 && (
              <div className="p-12 text-center text-ink-muted text-sm">Nessuna notizia. Crea la prima.</div>
            )}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}

function EditForm({
  editing, onCancel, onSave, saving,
}: {
  editing: NonNullable<Editing>;
  onCancel: () => void;
  onSave: (v: any) => void;
  saving: boolean;
}) {
  const [v, setV] = useState(editing);
  function update<K extends keyof typeof v>(k: K, val: (typeof v)[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...(v.id ? { id: v.id } : {}),
          slug: v.slug.trim(),
          title: v.title.trim(),
          excerpt: v.excerpt.trim(),
          body: v.body,
          category: v.category.trim(),
          cover_url: v.cover_url.trim(),
          published_at: v.published_at ? new Date(v.published_at).toISOString() : null,
        });
      }}
      className="bg-surface rounded-3xl ring-1 ring-foreground/5 p-6 space-y-5"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <Input label="Titolo *" value={v.title} onChange={(x) => update("title", x)} required />
        <Input label="Slug * (a-z, 0-9, trattini)" value={v.slug} onChange={(x) => update("slug", x)} required pattern="[a-z0-9-]+" />
        <Input label="Categoria *" value={v.category} onChange={(x) => update("category", x)} required />
        <Input label="Pubblica il" value={v.published_at} onChange={(x) => update("published_at", x)} type="datetime-local" />
      </div>

      <CoverField value={v.cover_url} onChange={(x) => update("cover_url", x)} />

      <TextArea label="Estratto *" rows={2} value={v.excerpt} onChange={(x) => update("excerpt", x)} required />

      <MarkdownEditor label="Contenuto (markdown) *" value={v.body} onChange={(x) => update("body", x)} />

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-foreground">Annulla</button>
      </div>
    </form>
  );
}

function CoverField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File troppo grande (max 10 MB)"); return; }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `news-covers/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, f, { upsert: true, contentType: f.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success("Copertina caricata");
    } catch (err: any) {
      toast.error(err.message ?? "Errore upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Copertina</label>
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-start">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="url"
          placeholder="URL immagine o carica un file"
          className="w-full bg-background rounded-xl px-4 py-2.5 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-background ring-1 ring-foreground/10 hover:ring-accent px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          <Upload size={14} /> {uploading ? "Caricamento…" : "Carica file"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <div className="mt-3 rounded-xl overflow-hidden ring-1 ring-foreground/10 bg-background">
          <img src={value} alt="Anteprima copertina" className="w-full max-h-56 object-cover" />
        </div>
      )}
    </div>
  );
}

function MarkdownEditor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function wrap(before: string, after = before, placeholder = "testo") {
    const ta = ref.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  }

  function linePrefix(prefix: string) {
    const ta = ref.current; if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const before = value.slice(0, lineStart);
    const block = value.slice(lineStart, end);
    const transformed = block.split("\n").map((l) => prefix + l).join("\n");
    onChange(before + transformed + value.slice(end));
  }

  function insertAtCursor(text: string) {
    const ta = ref.current; if (!ta) { onChange(value + text); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    onChange(value.slice(0, start) + text + value.slice(end));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File troppo grande (max 10 MB)"); return; }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `news-body/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, f, { upsert: true, contentType: f.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      insertAtCursor(`\n![immagine](${pub.publicUrl})\n`);
      toast.success("Immagine inserita");
    } catch (err: any) {
      toast.error(err.message ?? "Errore upload");
    } finally {
      setUploading(false);
    }
  }

  const Btn = ({ onClick, title, children }: any) => (
    <button type="button" onClick={onClick} title={title}
      className="p-2 rounded-lg hover:bg-foreground/5 text-ink-muted hover:text-foreground">
      {children}
    </button>
  );

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">{label}</label>
      <div className="rounded-xl ring-1 ring-foreground/10 bg-background overflow-hidden">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-foreground/10 bg-surface/50">
          <Btn title="Titolo H1" onClick={() => linePrefix("# ")}><Heading1 size={16} /></Btn>
          <Btn title="Titolo H2" onClick={() => linePrefix("## ")}><Heading2 size={16} /></Btn>
          <Btn title="Titolo H3" onClick={() => linePrefix("### ")}><Heading3 size={16} /></Btn>
          <span className="w-px h-5 bg-foreground/10 mx-1" />
          <Btn title="Grassetto" onClick={() => wrap("**")}><Bold size={16} /></Btn>
          <Btn title="Corsivo" onClick={() => wrap("*")}><Italic size={16} /></Btn>
          <Btn title="Codice" onClick={() => wrap("`")}><Code size={16} /></Btn>
          <span className="w-px h-5 bg-foreground/10 mx-1" />
          <Btn title="Lista" onClick={() => linePrefix("- ")}><List size={16} /></Btn>
          <Btn title="Lista numerata" onClick={() => linePrefix("1. ")}><ListOrdered size={16} /></Btn>
          <Btn title="Citazione" onClick={() => linePrefix("> ")}><Quote size={16} /></Btn>
          <span className="w-px h-5 bg-foreground/10 mx-1" />
          <Btn title="Link" onClick={() => {
            const url = prompt("URL del link:"); if (!url) return;
            wrap("[", `](${url})`, "testo del link");
          }}><LinkIcon size={16} /></Btn>
          <Btn title="Inserisci immagine (URL)" onClick={() => {
            const url = prompt("URL immagine:"); if (!url) return;
            insertAtCursor(`\n![immagine](${url})\n`);
          }}><ImageIcon size={16} /></Btn>
          <Btn title="Carica immagine" onClick={() => fileRef.current?.click()}>
            <Upload size={16} />
          </Btn>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className="flex-1" />
          <button type="button" onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-foreground hover:bg-foreground/5">
            <Eye size={14} /> {preview ? "Modifica" : "Anteprima"}
          </button>
        </div>
        {preview ? (
          <div className="p-4 prose prose-sm max-w-none min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
        ) : (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={16}
            required
            className="w-full bg-background px-4 py-3 focus:outline-none text-sm font-mono resize-y"
            placeholder="Scrivi qui in markdown…"
          />
        )}
      </div>
      {uploading && <p className="text-xs text-ink-muted mt-1">Caricamento immagine…</p>}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(md: string): string {
  // Minimal markdown -> HTML for preview only
  const lines = md.split("\n");
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const inline = (s: string) => escapeHtml(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;border-radius:8px;margin:8px 0" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const raw of lines) {
    const line = raw;
    if (/^###\s+/.test(line)) { closeList(); out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`); continue; }
    if (/^##\s+/.test(line)) { closeList(); out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`); continue; }
    if (/^#\s+/.test(line)) { closeList(); out.push(`<h1>${inline(line.replace(/^#\s+/, ""))}</h1>`); continue; }
    if (/^>\s?/.test(line)) { closeList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); continue; }
    if (/^-\s+/.test(line)) { if (inList !== "ul") { closeList(); out.push("<ul>"); inList = "ul"; } out.push(`<li>${inline(line.replace(/^-\s+/, ""))}</li>`); continue; }
    if (/^\d+\.\s+/.test(line)) { if (inList !== "ol") { closeList(); out.push("<ol>"); inList = "ol"; } out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`); continue; }
    if (line.trim() === "") { closeList(); out.push(""); continue; }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

function Input(props: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; pattern?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        required={props.required}
        type={props.type ?? "text"}
        pattern={props.pattern}
        className="w-full bg-background rounded-xl px-4 py-2.5 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm"
      />
    </div>
  );
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; rows: number; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={props.rows}
        required={props.required}
        className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm font-mono"
      />
    </div>
  );
}
