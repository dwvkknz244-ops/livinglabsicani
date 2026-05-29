import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { submitContact } from "@/lib/news.functions";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — LivingLab Sicani" },
      { name: "description", content: "Scrivici per maggiori informazioni sul consorzio LivingLab Sicani." },
      { property: "og:title", content: "Contatti — LivingLab Sicani" },
      { property: "og:description", content: "Contatta il consorzio LivingLab Sicani." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContact);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? "") || undefined,
          message: String(fd.get("message") ?? ""),
        },
      });
      toast.success("Messaggio inviato!");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Errore nell'invio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-12 grid md:grid-cols-2 gap-16">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4 block">Contatti</span>
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.05] text-balance mb-8">
            Scrivici.
          </h1>
          <div className="space-y-6 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">Sede</div>
              <div className="text-foreground">Piazza Umberto I, 92020<br/>Monti Sicani (AG)</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">Email</div>
              <a href="mailto:info@livinglabsicani.it" className="text-accent hover:underline">info@livinglabsicani.it</a>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted mb-1">Telefono</div>
              <div className="text-foreground">+39 0922 123 456</div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-surface rounded-3xl p-8 ring-1 ring-foreground/5 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Nome *</label>
            <input name="name" required className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Email *</label>
            <input name="email" type="email" required className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Oggetto</label>
            <input name="subject" className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Messaggio *</label>
            <textarea name="message" rows={5} required className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <button type="submit" disabled={loading} className="bg-accent text-accent-foreground py-3 px-6 rounded-xl text-sm font-medium ring-2 ring-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50">
            {loading ? "Invio…" : "Invia messaggio"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
