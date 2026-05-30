import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — LivingLab Sicani" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Hard redirect: garantisce che la sessione sia hydratata quando /admin carica
      window.location.href = "/admin";
    } catch (err: any) {
      toast.error(err.message ?? "Errore di autenticazione");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-md mx-auto px-6 pt-24">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Accedi</h1>
        <p className="text-sm text-ink-muted mb-8">Area riservata amministratori.</p>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-6 ring-1 ring-foreground/5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Email</label>
            <input name="email" type="email" required className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">Password</label>
            <input name="password" type="password" required minLength={6} className="w-full bg-background rounded-xl px-4 py-3 ring-1 ring-foreground/10 focus:ring-accent focus:outline-none text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground py-3 rounded-xl text-sm font-medium ring-2 ring-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50">
            {loading ? "…" : "Accedi"}
          </button>
        </form>

        <p className="text-xs text-ink-muted mt-6 text-center">
          L'accesso è riservato agli amministratori. Per ottenere un account contatta il responsabile del sito.
        </p>
        <Link to="/" className="text-xs text-ink-muted hover:text-accent mt-4 block text-center">Torna alla home</Link>
      </main>
    </div>
  );
}
