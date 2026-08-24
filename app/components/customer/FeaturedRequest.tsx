export default function FeaturedRequest({
  badge,
  title,
  meta,
  detail,
  cta,
}: {
  badge: string;
  title: string;
  meta: string;
  detail: string;
  cta: string;
}) {
  return (
    <article className="rounded-2xl border border-line/20 bg-white p-10 shadow-[0_16px_40px_-12px_rgba(19,27,46,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center rounded-full bg-badge px-3.5 py-1 text-xs font-semibold text-primary-dark">
          {badge}
        </span>
        <button
          type="button"
          aria-label="Más opciones"
          className="grid h-8 w-8 place-items-center rounded-full text-steel transition hover:bg-panel"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden="true">
            <circle cx="2" cy="2" r="1.6" />
            <circle cx="8" cy="2" r="1.6" />
            <circle cx="14" cy="2" r="1.6" />
          </svg>
        </button>
      </div>
      <h2 className="mt-4 font-[family-name:var(--font-figtree)] text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <rect x="1.5" y="2.5" width="12" height="11" rx="2" stroke="#424656" strokeWidth="1.2" />
          <path d="M1.5 5.5H13.5M4.5 1V4M10.5 1V4" stroke="#424656" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {meta}
      </p>
      <div className="mt-6 flex gap-0 overflow-hidden rounded-xl bg-panel">
        <div className="w-1.5 shrink-0 bg-primary-dark" />
        <p className="px-5 py-5 text-sm leading-relaxed text-steel">{detail}</p>
      </div>
      <div className="mt-6">
        <button
          type="button"
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {cta}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M2 8H14M14 8L9.5 3.5M14 8L9.5 12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}
