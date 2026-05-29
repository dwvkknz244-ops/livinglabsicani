import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { EditableImage } from "@/components/EditableImage";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_url: string | null;
  published_at: string | null;
  featured?: boolean;
  index?: number;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function NewsCard({ slug, title, excerpt, category, cover_url, published_at, featured, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to="/news/$slug" params={{ slug }} className="block">
        <div className={`mb-5 overflow-hidden rounded-2xl bg-surface-muted ring-1 ring-foreground/5 ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          {cover_url ? (
            <EditableImage
              imageKey={`news-cover:${slug}`}
              src={cover_url}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface to-surface-muted" />
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">{category}</span>
          <span className="text-[11px] text-ink-muted">{formatDate(published_at)}</span>
        </div>
        <h3 className={`font-medium leading-tight text-pretty group-hover:text-accent transition-colors ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
          {title}
        </h3>
        <p className="text-sm text-ink-muted mt-3 leading-relaxed line-clamp-2">{excerpt}</p>
      </Link>
    </motion.article>
  );
}
