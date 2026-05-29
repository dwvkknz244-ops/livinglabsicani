import { useQuery } from "@tanstack/react-query";
import { pageBlocksQueryOptions } from "@/lib/blocks.queries";
import type { PageBlock } from "@/lib/blocks.functions";
import { EditableImage } from "./EditableImage";

export function PageBlocks({ page }: { page: string }) {
  const q = useQuery(pageBlocksQueryOptions(page));
  const blocks = q.data ?? [];
  if (blocks.length === 0) return null;

  const stats = blocks.filter((b) => b.type === "stat");
  const nonStats = blocks.filter((b) => b.type !== "stat");

  return (
    <div className="space-y-10">
      {nonStats.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
      {stats.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          {stats.map((b) => (
            <div key={b.id} className="bg-surface rounded-3xl p-8 ring-1 ring-foreground/5">
              <div className="text-4xl font-semibold tracking-tight text-accent">{b.title}</div>
              <div className="text-xs uppercase tracking-widest text-ink-muted mt-3">{b.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockView({ block: b }: { block: PageBlock }) {
  if (b.type === "image" && b.image_url) {
    return (
      <figure>
        <EditableImage
          imageKey={`block:${b.id}`}
          src={b.image_url}
          alt={b.image_alt ?? b.title ?? ""}
          className="w-full rounded-3xl object-cover"
        />
        {b.title && (
          <figcaption className="text-sm text-ink-muted mt-3 italic">{b.title}</figcaption>
        )}
      </figure>
    );
  }
  if (b.type === "cta") {
    return (
      <div className="bg-surface rounded-3xl p-8 ring-1 ring-foreground/5">
        {b.title && <h3 className="text-2xl font-semibold mb-3">{b.title}</h3>}
        {b.body && <p className="text-ink-muted mb-5 whitespace-pre-line">{b.body}</p>}
        {b.cta_label && b.cta_href && (
          <a
            href={b.cta_href}
            className="inline-block bg-accent text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-xl"
          >
            {b.cta_label}
          </a>
        )}
      </div>
    );
  }
  // text
  return (
    <div>
      {b.title && (
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{b.title}</h2>
      )}
      {b.body && (
        <p className="text-lg text-ink-muted leading-relaxed whitespace-pre-line">{b.body}</p>
      )}
    </div>
  );
}
