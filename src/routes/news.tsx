import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NewsCard } from "@/components/NewsCard";
import { allNewsQueryOptions } from "@/lib/news.queries";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — LivingLab Sicani" },
      { name: "description", content: "Tutte le notizie del consorzio LivingLab Sicani." },
      { property: "og:title", content: "News — LivingLab Sicani" },
      { property: "og:description", content: "Archivio notizie del consorzio LivingLab Sicani." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allNewsQueryOptions),
  component: NewsListPage,
});

function NewsListPage() {
  const { data: news } = useSuspenseQuery(allNewsQueryOptions);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-4 block">Magazine</span>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance mb-16">
          Tutte le <span className="text-accent italic">notizie</span>.
        </h1>
        {news.length === 0 ? (
          <div className="bg-surface rounded-3xl p-16 text-center">
            <p className="text-ink-muted">Nessuna notizia pubblicata.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {news.map((n, i) => <NewsCard key={n.id} {...n} index={i} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
