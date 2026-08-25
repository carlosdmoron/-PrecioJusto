import React from "react";

export type LegalDefinition = {
  term: string;
  definition: string;
};

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  definitions?: LegalDefinition[];
};

export type LegalDoc = {
  badge: string;
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
};

function LegalText({ text, lang }: { text: string; lang: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (!match) return <React.Fragment key={i}>{part}</React.Fragment>;
        return (
          <a
            key={i}
            href={match[2].replace("{lang}", lang)}
            className="font-medium text-primary underline-offset-2 transition hover:underline"
          >
            {match[1]}
          </a>
        );
      })}
    </>
  );
}

export default function LegalDocument({
  doc,
  lang,
}: {
  doc: LegalDoc;
  lang: string;
}) {
  return (
    <div className="flex-1 bg-white">
      <header className="border-b border-line/30">
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-14 pt-16 lg:px-20 lg:pt-24">
          <span className="inline-flex h-8 items-center rounded-full bg-chip-blue px-4 text-xs font-semibold uppercase tracking-wide text-primary-dark">
            {doc.badge}
          </span>
          <h1 className="mt-6 font-[family-name:var(--font-figtree)] text-4xl font-bold tracking-tight text-navy md:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted">{doc.updated}</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-16 lg:px-20">
        <div className="max-w-3xl space-y-12">
          <div className="space-y-4 border-l-2 border-chip-blue pl-6">
            {doc.intro.map((paragraph, i) => (
              <p key={i} className="leading-relaxed text-steel">
                <LegalText text={paragraph} lang={lang} />
              </p>
            ))}
          </div>

          {doc.sections.map((section, s) => (
            <section key={s} aria-label={section.heading}>
              <h2 className="flex items-center gap-3 font-[family-name:var(--font-figtree)] text-xl font-bold text-navy md:text-2xl">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
                  {s + 1}
                </span>
                {section.heading}
              </h2>

              <div className="mt-5 space-y-4 md:pl-10">
                {(section.paragraphs ?? []).map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-muted">
                    <LegalText text={paragraph} lang={lang} />
                  </p>
                ))}

                {section.definitions && (
                  <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {section.definitions.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-line/40 bg-surface p-5"
                      >
                        <dt className="text-sm font-semibold text-navy">
                          {item.term}
                        </dt>
                        <dd className="mt-2 text-sm leading-relaxed text-muted">
                          {item.definition}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.list && (
                  <ul className="space-y-2.5">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 leading-relaxed text-muted"
                      >
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <p className="border-t border-line/30 pt-8 text-sm text-faint">
            legal@preciojusto.com · PrecioJusto
          </p>
        </div>
      </main>
    </div>
  );
}
