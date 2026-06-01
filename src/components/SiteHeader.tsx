import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EditableLogo } from "./EditableLogo";

const navItems = [
  { to: "/chi-siamo", label: "Chi siamo" },
  { to: "/servizi", label: "Servizi" },
  { to: "/news", label: "News" },
  { to: "/partecipa", label: "Partecipa" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 md:px-6">
      <div className="bg-background/80 backdrop-blur-xl ring-1 ring-foreground/10 rounded-2xl px-5 h-16 flex items-center justify-between">
        {isAuthed ? (
          <EditableLogo imageKey="site-logo" className="flex items-baseline gap-1.5">
            <span className="font-semibold tracking-tight text-base">LivingLab</span>
            <span className="text-accent font-medium text-[11px] uppercase tracking-[0.2em]">Sicani</span>
          </EditableLogo>
        ) : (
          <Link to="/">
            <EditableLogo imageKey="site-logo" className="flex items-baseline gap-1.5">
              <span className="font-semibold tracking-tight text-base">LivingLab</span>
              <span className="text-accent font-medium text-[11px] uppercase tracking-[0.2em]">Sicani</span>
            </EditableLogo>
          </Link>
        )}

        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-ink-muted hover:text-accent transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed && (
            <Link
              to="/admin"
              className="hidden md:inline-flex text-xs font-medium text-ink-muted hover:text-accent transition-colors px-3"
            >
              Admin
            </Link>
          )}
          <Link
            to="/contatti"
            className="hidden md:inline-flex bg-accent text-accent-foreground text-sm font-medium py-2 px-4 rounded-xl ring-2 ring-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all"
          >
            Contatti
          </Link>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Apri menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-2 bg-background ring-1 ring-foreground/10 rounded-2xl p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-surface rounded-lg"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contatti"
            className="block px-3 py-2 text-sm font-medium text-accent"
            onClick={() => setOpen(false)}
          >
            Contatti
          </Link>
          {isAuthed && (
            <Link
              to="/admin"
              className="block px-3 py-2 text-sm font-medium text-ink-muted"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
