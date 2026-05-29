import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { submitMembership } from "@/lib/news.functions";

export const Route = createFileRoute("/partecipa")({
  head: () => ({
    meta: [
      { title: "Partecipa — LivingLab Sicani" },
      { name: "description", content: "Diventa socio del consorzio LivingLab Sicani: requisiti, vantaggi e modulo di adesione." },
      { property: "og:title", content: "Partecipa — LivingLab Sicani" },
      { property: "og:description", content: "Diventa socio del consorzio LivingLab Sicani." },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const submit = useServerFn(submitMembership);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          company_name: String(fd.get("company_name") ?? ""),
          contact_name: String(fd.get("contact_name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? "") || undefined,
          product_category: String(fd.get("product_category") ?? "") || undefined,
          message: String(fd.get("message") ?? "") || undefined,
        },
      });
      toast.success("Richiesta inviata! Ti contatteremo presto.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Errore nell'invio. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-12">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4 block">Partecipa</span>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance mb-6">
          Entra nella <span className="text-accent italic">rete</span> dei Sicani.
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed mb-12">
          Compila il modulo: il nostro team valuterà la tua candidatura e ti risponderà entro 7 giorni lavorativi con i passi successivi.
        </p>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-8 ring-1 ring-foreground/5 space-y-5">
          <Field name="company_name" label="Nome azienda" required />
          <Field name="contact_name" label="Referente" required />
          <div className="grid md:grid-cols-2 gap-5">
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Telefono" />
          </div>
          <Field name="product_category" label="Categoria di prodotto" placeholder="Es. olio extravergine, grani antichi, formaggi…" />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Messaggio</label>
            <textarea name="message" rows={4} className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <button type="submit" disabled={loading} className="bg-accent text-accent-foreground py-3 px-6 rounded-xl text-sm font-medium ring-2 ring-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50">
            {loading ? "Invio…" : "Invia richiesta"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ name, label, type = "text", required, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm"
      />
    </div>
  );
}
