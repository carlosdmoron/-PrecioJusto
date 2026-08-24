"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export default function ExploreTabs({
  tabs,
  empty,
  ctaHref,
  children,
}: {
  tabs: { explorar: string; solicitudes: string };
  empty: { title: string; text: string; cta: string };
  ctaHref: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState<"explorar" | "solicitudes">("explorar");

  return (
    <div>
      <div
        role="tablist"
        aria-label={tabs.explorar}
        className="inline-flex rounded-xl bg-sidebar p-1"
      >
        {(["explorar", "solicitudes"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={`h-12 rounded-lg px-7 text-sm transition ${
              active === key
                ? "bg-white font-semibold text-ink shadow-[0_4px_14px_-4px_rgba(19,27,46,0.15)]"
                : "font-medium text-steel hover:text-ink"
            }`}
          >
            {tabs[key]}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {active === "explorar" ? (
          children
        ) : (
          <div className="rounded-2xl border border-line/20 bg-white p-10 text-center">
            <h2 className="font-[family-name:var(--font-figtree)] text-lg font-semibold text-ink">
              {empty.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{empty.text}</p>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              {empty.cta}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
