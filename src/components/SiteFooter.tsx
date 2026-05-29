import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 mt-32 pt-20 pb-10 px-6 bg-surface">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-1.5 mb-5">
            <span className="font-semibold tracking-tight text-lg">LivingLab</span>
            <span className="text-accent font-medium text-[11px] uppercase tracking-[0.2em]">Sicani</span>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed max-w-[36ch]">
            Consorzio che unisce i produttori agroalimentari delle terre Sicane.
            Custodi della biodiversità mediterranea e laboratorio di innovazione rurale.
          </p>
        </div>

        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-5 block">Consorzio</span>
            <ul className="space-y-3">
              <li><Link to="/chi-siamo" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Chi siamo</Link></li>
              <li><Link to="/servizi" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Servizi</Link></li>
              <li><Link to="/partecipa" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Partecipa</Link></li>
            </ul>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-5 block">Risorse</span>
            <ul className="space-y-3">
              <li><Link to="/news" className="text-sm font-medium text-foreground hover:text-accent transition-colors">News</Link></li>
              <li><Link to="/contatti" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Contatti</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-5 block">Sede</span>
            <p className="text-sm text-foreground leading-relaxed">
              Piazza Umberto I<br/>
              92020 Sicani (AG)<br/>
              <a href="mailto:info@livinglabsicani.it" className="text-accent hover:underline">info@livinglabsicani.it</a>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-ink-muted">© {new Date().getFullYear()} LivingLab Sicani — Tutti i diritti riservati.</p>
        <p className="text-xs text-ink-muted">Innovazione di prossimità.</p>
      </div>
    </footer>
  );
}
