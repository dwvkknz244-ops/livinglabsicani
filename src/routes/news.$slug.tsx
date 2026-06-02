import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
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

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

function NewsDetailPage() {
  const { slug } = Route.useParams();
  const { data: news } = useSuspenseQuery(newsBySlugQueryOptions(slug));
  if (!news) return null;

  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Back link */}
        <nav className="mb-12">
          <Link
            to="/news"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-accent transition-colors"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Tutte le notizie
          </Link>
        </nav>

        {/* Header */}
        <motion.header {...fadeUp} className="mb-14">
          <div className="flex items-center gap-3 mb-7">
            <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-semibold tracking-wider uppercase">
              {news.category}
            </span>
            {formattedDate && (
              <time className="text-sm text-ink-muted">{formattedDate}</time>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-balance mb-8 text-foreground">
            {news.title}
          </h1>

          <p className="text-xl md:text-2xl text-ink-muted leading-relaxed max-w-2xl font-normal">
            {news.excerpt}
          </p>
        </motion.header>

        {/* Cover */}
        {news.cover_url && (
          <motion.figure
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mb-16 md:-mx-12 lg:-mx-20"
          >
            <div className="aspect-video rounded-3xl overflow-hidden bg-surface-muted ring-1 ring-foreground/5 shadow-xl shadow-accent/10">
              <EditableImage
                imageKey={`news-cover:${news.slug}`}
                src={news.cover_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.figure>
        )}

        {/* Body */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="max-w-[68ch] mx-auto"
        >
          <article
            className="
              prose prose-neutral prose-lg max-w-none
              prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:mb-7
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-accent
              prose-blockquote:bg-surface prose-blockquote:rounded-r-2xl prose-blockquote:px-8 prose-blockquote:py-6
              prose-blockquote:my-10 prose-blockquote:text-foreground prose-blockquote:font-medium
              prose-blockquote:text-xl prose-blockquote:leading-snug
              prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-foreground/5
              prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-foreground/85
              prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            "
          >
            <ReactMarkdown>{news.body}</ReactMarkdown>
          </article>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-ink-muted uppercase tracking-widest">Categoria</span>
              <span className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                {news.category}
              </span>
              <span className="text-ink-muted/40">•</span>
              <Link to="/news" className="text-sm font-medium text-ink-muted hover:text-accent transition-colors">
                Torna all'archivio
              </Link>
            </div>
          </footer>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
