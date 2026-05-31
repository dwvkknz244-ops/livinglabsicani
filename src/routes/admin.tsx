import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, LogOut } from "lucide-react";
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
        <Input label="URL copertina (opzionale)" value={v.cover_url} onChange={(x) => update("cover_url", x)} type="url" />
        <Input label="Pubblica il" value={v.published_at} onChange={(x) => update("published_at", x)} type="datetime-local" />
      </div>
      <TextArea label="Estratto *" rows={2} value={v.excerpt} onChange={(x) => update("excerpt", x)} required />
      <TextArea label="Contenuto (markdown) *" rows={12} value={v.body} onChange={(x) => update("body", x)} required />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-foreground">Annulla</button>
      </div>
    </form>
  );
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
