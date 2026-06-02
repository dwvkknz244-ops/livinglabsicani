import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageBlocks } from "@/components/PageBlocks";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — LivingLab Sicani" },
      { name: "description", content: "La storia, la missione e la visione del consorzio LivingLab Sicani." },
      { property: "og:title", content: "Chi siamo — LivingLab Sicani" },
      { property: "og:description", content: "Custodi del territorio agroalimentare dei Monti Sicani." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-24">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4 block">Il consorzio</span>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance mb-16">
          Chi <span className="text-accent italic">siamo</span>.
        </h1>
        <PageBlocks page="chi-siamo" />
      </main>
      <SiteFooter />
    </div>
  );
}
