import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pageBlocksAdminQueryOptions, PAGES } from "@/lib/blocks.queries";
import { upsertPageBlock, deletePageBlock, reorderPageBlock } from "@/lib/blocks.functions";
import type { PageBlock } from "@/lib/blocks.functions";

type Draft = {
  id?: string;
  page: string;
  sort_order: number;
  type: "text" | "image" | "cta" | "stat";
  title: string;
  body: string;
  image_url: string;
  image_alt: string;
  cta_label: string;
  cta_href: string;
  visible: boolean;
};

function emptyDraft(page: string, sort: number): Draft {
  return {
    page, sort_order: sort, type: "text",
    title: "", body: "", image_url: "", image_alt: "",
    cta_label: "", cta_href: "", visible: true,
  };
}

export function BlocksEditor() {
  const [page, setPage] = useState(PAGES[0].id);
  const [editing, setEditing] = useState<Draft | null>(null);
  const qc = useQueryClient();
  const q = useQuery(pageBlocksAdminQueryOptions(page));
  const upsertFn = useServerFn(upsertPageBlock);
  const deleteFn = useServerFn(deletePageBlock);
  const reorderFn = useServerFn(reorderPageBlock);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["page-blocks-admin", page] });
    qc.invalidateQueries({ queryKey: ["page-blocks", page] });
  };

  const upsertM = useMutation({
    mutationFn: upsertFn,
    onSuccess: () => { toast.success("Salvato"); setEditing(null); invalidate(); },
    onError: (e: any) => toast.error(e.message ?? "Errore"),
  });
  const deleteM = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => { toast.success("Eliminato"); invalidate(); },
  });
  const reorderM = useMutation({
    mutationFn: reorderFn,
    onSuccess: invalidate,
  });

  const blocks = q.data ?? [];
  const nextOrder = (blocks[blocks.length - 1]?.sort_order ?? 0) + 10;

  function move(b: PageBlock, dir: -1 | 1) {
    const i = blocks.findIndex((x) => x.id === b.id);
    const swap = blocks[i + dir];
    if (!swap) return;
    reorderM.mutate({ data: { id: b.id, sort_order: swap.sort_order } });
    reorderM.mutate({ data: { id: swap.id, sort_order: b.sort_order } });
  }

  function toggleVisible(b: PageBlock) {
    upsertM.mutate({
      data: {
        id: b.id, page: b.page, sort_order: b.sort_order, type: b.type,
        title: b.title ?? "", body: b.body ?? "",
        image_url: b.image_url ?? "", image_alt: b.image_alt ?? "",
        cta_label: b.cta_label ?? "", cta_href: b.cta_href ?? "",
        visible: !b.visible,
      },
    });
  }

  function edit(b: PageBlock) {
    setEditing({
      id: b.id, page: b.page, sort_order: b.sort_order, type: b.type,
      title: b.title ?? "", body: b.body ?? "",
      image_url: b.image_url ?? "", image_alt: b.image_alt ?? "",
      cta_label: b.cta_label ?? "", cta_href: b.cta_href ?? "",
      visible: b.visible,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPage(p.id); setEditing(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium ring-1 ${page === p.id ? "bg-accent text-accent-foreground ring-accent" : "ring-foreground/10 hover:bg-surface"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Blocchi di "{PAGES.find((p) => p.id === page)?.label}"</h2>
        <button
          onClick={() => setEditing(emptyDraft(page, nextOrder))}
          className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-xl inline-flex items-center gap-2"
        >
          <Plus size={16} /> Nuovo blocco
        </button>
      </div>

      {editing ? (
        <BlockForm
          draft={editing}
          onCancel={() => setEditing(null)}
          onSave={(d) => upsertM.mutate({ data: d })}
          saving={upsertM.isPending}
        />
      ) : (
        <div className="bg-surface rounded-3xl ring-1 ring-foreground/5 divide-y divide-foreground/5">
          {blocks.map((b, i) => (
            <div key={b.id} className="p-4 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button disabled={i === 0} onClick={() => move(b, -1)} className="p-1 text-ink-muted hover:text-foreground disabled:opacity-30"><ArrowUp size={14} /></button>
                <button disabled={i === blocks.length - 1} onClick={() => move(b, 1)} className="p-1 text-ink-muted hover:text-foreground disabled:opacity-30"><ArrowDown size={14} /></button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">{b.type}</span>
                  {!b.visible && <span className="text-[10px] text-ink-muted">(nascosto)</span>}
                </div>
                <div className="font-medium truncate">{b.title || b.body?.slice(0, 80) || "(senza titolo)"}</div>
              </div>
              <button onClick={() => toggleVisible(b)} title={b.visible ? "Nascondi" : "Mostra"} className="p-2 text-ink-muted hover:text-foreground">
                {b.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => edit(b)} className="text-sm text-accent hover:underline">Modifica</button>
              <button onClick={() => { if (confirm("Eliminare il blocco?")) deleteM.mutate({ data: { id: b.id } }); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {blocks.length === 0 && (
            <div className="p-12 text-center text-ink-muted text-sm">Nessun blocco. Aggiungine uno.</div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockForm({
  draft, onCancel, onSave, saving,
}: {
  draft: Draft;
  onCancel: () => void;
  onSave: (d: Draft) => void;
  saving: boolean;
}) {
  const [v, setV] = useState<Draft>(draft);
  const [uploading, setUploading] = useState(false);
  const upd = <K extends keyof Draft>(k: K, val: Draft[K]) => setV((p) => ({ ...p, [k]: val }));

  async function uploadFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10 MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `blocks/${v.page}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      upd("image_url", pub.publicUrl);
      toast.success("Immagine caricata");
    } catch (e: any) {
      toast.error(e.message ?? "Errore upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(v); }}
      className="bg-surface rounded-3xl ring-1 ring-foreground/5 p-6 space-y-5"
    >
      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Tipo</label>
          <select value={v.type} onChange={(e) => upd("type", e.target.value as Draft["type"])} className="w-full bg-background rounded-xl px-4 py-2.5 ring-1 ring-foreground/10 text-sm">
            <option value="text">Testo (titolo + paragrafo)</option>
            <option value="image">Immagine</option>
            <option value="cta">Call to action</option>
            <option value="stat">Statistica (numero + etichetta)</option>
          </select>
        </div>
        <Input label="Ordine" type="number" value={String(v.sort_order)} onChange={(x) => upd("sort_order", Number(x) || 0)} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Visibilità</label>
          <label className="flex items-center gap-2 px-4 py-2.5">
            <input type="checkbox" checked={v.visible} onChange={(e) => upd("visible", e.target.checked)} />
            <span className="text-sm">Visibile sul sito</span>
          </label>
        </div>
      </div>

      <Input label={v.type === "stat" ? "Numero (es. 140+)" : "Titolo"} value={v.title} onChange={(x) => upd("title", x)} />
      <TextArea label={v.type === "stat" ? "Etichetta" : "Testo / paragrafo"} rows={v.type === "stat" ? 1 : 6} value={v.body} onChange={(x) => upd("body", x)} />

      {v.type === "image" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Immagine</label>
            <div className="flex gap-2">
              <input
                value={v.image_url}
                onChange={(e) => upd("image_url", e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-background rounded-xl px-4 py-2.5 ring-1 ring-foreground/10 text-sm"
              />
              <label className="cursor-pointer bg-background ring-1 ring-foreground/10 rounded-xl px-3 py-2.5 text-sm inline-flex items-center gap-2 hover:bg-surface">
                <Upload size={14} /> {uploading ? "..." : "Carica"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadFile(f); }} />
              </label>
            </div>
            {v.image_url && <img src={v.image_url} alt="" className="mt-3 max-h-40 rounded-xl" />}
          </div>
          <Input label="Testo alternativo" value={v.image_alt} onChange={(x) => upd("image_alt", x)} />
        </div>
      )}

      {v.type === "cta" && (
        <div className="grid md:grid-cols-2 gap-5">
          <Input label="Etichetta pulsante" value={v.cta_label} onChange={(x) => upd("cta_label", x)} />
          <Input label="Link pulsante" value={v.cta_href} onChange={(x) => upd("cta_href", x)} placeholder="/contatti o https://..." />
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving || uploading} className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          {saving ? "Salvataggio…" : "Salva"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-foreground">Annulla</button>
      </div>
    </form>
  );
}

function Input(props: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        className="w-full bg-background rounded-xl px-4 py-2.5 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm"
      />
    </div>
  );
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={props.rows}
        className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm"
      />
    </div>
  );
}
