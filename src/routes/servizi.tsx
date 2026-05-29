import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Sprout, ShieldCheck, Palette, Network, FlaskConical } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/servizi")({
  head: () => ({
    meta: [
      { title: "Servizi e attività — LivingLab Sicani" },
      { name: "description", content: "Tutti i servizi che il consorzio LivingLab Sicani offre ai produttori associati." },
      { property: "og:title", content: "Servizi — LivingLab Sicani" },
      { property: "og:description", content: "Servizi e attività del consorzio LivingLab Sicani." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Cpu, title: "Agro-Tech Hub", body: "Sensoristica IoT per monitoraggio idrico, suolo e microclima in tempo reale. Accesso a dashboard agronomiche dedicate." },
  { icon: Sprout, title: "Filiere identitarie", body: "Recupero e valorizzazione di varietà antiche di grano, legumi, ulivi e razze autoctone, con disciplinari condivisi." },
  { icon: ShieldCheck, title: "Tracciabilità digitale", body: "Tracciabilità end-to-end dal campo alla tavola tramite QR code e registri verificabili." },
  { icon: Palette, title: "Design Lab", body: "Riprogettazione di packaging, identità visiva e storytelling per i prodotti tipici, pensata per mercati nazionali e internazionali." },
  { icon: Network, title: "Network commerciale", body: "Filiere corte, accesso a buyer selezionati, partecipazione collettiva a fiere ed eventi di settore." },
  { icon: FlaskConical, title: "Laboratorio analisi", body: "Analisi dei suoli, certificazioni biologiche, accompagnamento ai marchi di tutela regionali ed europei." },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4 block">Servizi & attività</span>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance mb-6">
            Un ecosistema di <span className="text-accent italic">servizi</span> per i nostri soci.
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            Dall'innovazione tecnologica al supporto commerciale, accompagniamo ogni produttore in tutte le fasi della filiera.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.title} className="bg-surface p-8 rounded-3xl ring-1 ring-foreground/5 hover:ring-accent/30 transition-all">
              <div className="size-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-10">
                <s.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-xl font-medium mb-3">{s.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
