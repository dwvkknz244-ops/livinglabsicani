import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EditableImage } from "@/components/EditableImage";
import { newsBySlugQueryOptions } from "@/lib/news.queries";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(newsBySlugQueryOptions(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — LivingLab Sicani` },
          { name: "description", content: loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          ...(loaderData.cover_url ? [{ property: "og:image", content: loaderData.cover_url }] : []),
        ]
      : [{ title: "News — LivingLab Sicani" }],
  }),
  component: NewsDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-semibold mb-4">Notizia non trovata</h1>
        <Link to="/news" className="text-accent hover:underline">Torna all'archivio</Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-semibold mb-4">Errore di caricamento</h1>
        <Link to="/news" className="text-accent hover:underline">Torna all'archivio</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function NewsDetailPage() {
  const { slug } = Route.useParams();
  const { data: news } = useSuspenseQuery(newsBySlugQueryOptions(slug));
  if (!news) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent transition-colors mb-10">
          <ArrowLeft size={16} /> Tutte le notizie
        </Link>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">{news.category}</span>
          <span className="text-[11px] text-ink-muted">
            {news.published_at && new Date(news.published_at).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-balance mb-8">{news.title}</h1>
        <p className="text-lg text-ink-muted leading-relaxed mb-10">{news.excerpt}</p>
        {news.cover_url && (
          <div className="rounded-3xl overflow-hidden mb-12 ring-1 ring-foreground/5">
            <EditableImage
              imageKey={`news-cover:${news.slug}`}
              src={news.cover_url}
              alt={news.title}
              className="w-full"
            />
          </div>
        )}
        <article className="prose prose-neutral max-w-none text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-accent">
          <ReactMarkdown>{news.body}</ReactMarkdown>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
