import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Sprout, Cpu, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NewsCard } from "@/components/NewsCard";
import { EditableImage } from "@/components/EditableImage";
import { latestNewsQueryOptions } from "@/lib/news.queries";
import heroSicani from "@/assets/hero-sicani.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LivingLab Sicani — Consorzio agroalimentare dei Sicani" },
      { name: "description", content: "Il consorzio che unisce i produttori agroalimentari dei Monti Sicani. Innovazione, biodiversità, eccellenza siciliana." },
      { property: "og:title", content: "LivingLab Sicani" },
      { property: "og:description", content: "Consorzio agroalimentare dei Monti Sicani." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(latestNewsQueryOptions),
  component: HomePage,
});

function HomePage() {
  const { data: news } = useSuspenseQuery(latestNewsQueryOptions);
  const featured = news[0];
  const rest = news.slice(1, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="pt-16 pb-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="col-span-12 lg:col-span-6"
            >
              <div className="inline-flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full mb-8 ring-1 ring-accent/20">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">Consorzio Agroalimentare</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-semibold leading-[0.95] tracking-tight text-balance mb-8">
                Il battito <span className="text-accent italic">vivo</span> delle terre sicane.
              </h1>
              <p className="text-lg text-ink-muted max-w-[44ch] leading-relaxed mb-10">
                Uniamo la sapienza ancestrale dei produttori dei Monti Sicani con le tecnologie di domani per un'agricoltura rigenerativa e identitaria.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/partecipa" className="bg-accent text-accent-foreground py-3 px-6 rounded-xl text-sm font-medium ring-2 ring-accent/20 hover:shadow-lg hover:shadow-accent/20 transition-all inline-flex items-center gap-2">
                  Unisciti al consorzio <ArrowRight size={16} />
                </Link>
                <Link to="/servizi" className="border border-foreground/15 text-foreground py-3 px-6 rounded-xl text-sm font-medium hover:bg-surface transition-colors">
                  Scopri i servizi
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="col-span-12 lg:col-span-6 relative"
            >
              <div className="relative animate-float">
                <div className="w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-foreground/5">
                  <EditableImage
                    imageKey="home-hero"
                    src={heroSicani}
                    alt="Paesaggio dei Monti Sicani al tramonto"
                    width={1600}
                    height={1600}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-background p-5 rounded-2xl shadow-xl ring-1 ring-foreground/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-semibold tracking-tight">+140</span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">Produttori</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-accent p-5 rounded-2xl shadow-xl ring-4 ring-background">
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl font-semibold tracking-tight italic text-accent-foreground">Bio</span>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-accent-foreground/80">Certificato</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services strip */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-[44ch] mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Strumenti per la crescita.</h2>
              <p className="text-sm text-ink-muted leading-relaxed">Un ecosistema di servizi progettato per chi coltiva, trasforma e racconta la Sicilia interna.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: Cpu, title: "Agro-Tech Hub", body: "Sensoristica IoT e agricoltura di precisione per ottimizzare suolo e risorse idriche." },
                { icon: Sprout, title: "Filiere identitarie", body: "Recupero di varietà antiche, disciplinari di tutela e narrazione del territorio." },
                { icon: ShieldCheck, title: "Tracciabilità", body: "Sistemi digitali che garantiscono autenticità e qualità dal campo al consumatore." },
              ].map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-background p-8 rounded-3xl ring-1 ring-foreground/5 hover:ring-accent/30 transition-all"
                >
                  <div className="size-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-12">
                    <s.icon size={20} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{s.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* News */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-3 block">Magazine</span>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ultime notizie</h2>
              </div>
              <Link to="/news" className="text-sm font-medium text-ink-muted hover:text-accent transition-colors underline underline-offset-4">
                Archivio completo
              </Link>
            </div>

            {news.length === 0 ? (
              <div className="bg-surface rounded-3xl p-16 text-center">
                <p className="text-ink-muted">Nessuna notizia pubblicata. Torna presto.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-12">
                {featured && (
                  <NewsCard {...featured} featured index={0} />
                )}
                <div className="space-y-10">
                  {rest.map((n, i) => (
                    <NewsCard key={n.id} {...n} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto bg-accent/10 p-1 rounded-[40px]">
            <div className="bg-foreground rounded-[36px] px-8 py-20 lg:py-28 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 size-96 bg-accent/30 blur-[120px] rounded-full" />
              <h2 className="text-4xl lg:text-5xl font-semibold text-background tracking-tight mb-8 max-w-[18ch] relative">
                Coltiviamo <span className="text-accent">insieme</span> il futuro dei Sicani.
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 relative">
                <Link to="/partecipa" className="bg-accent text-accent-foreground py-4 px-8 rounded-2xl text-sm font-medium hover:scale-105 transition-transform">
                  Diventa socio
                </Link>
                <Link to="/contatti" className="bg-background/10 text-background backdrop-blur py-4 px-8 rounded-2xl text-sm font-medium hover:bg-background/20 transition-colors">
                  Contattaci
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
