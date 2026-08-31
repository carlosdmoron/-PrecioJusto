"use client";

import { useTransition } from "react";
import { logout } from "../../actions/auth";

type ChooserButton = {
  label: string;
  description: string;
  href: string;
  icon: "admin" | "customer" | "professional";
};

const ICONS: Record<ChooserButton["icon"], React.ReactNode> = {
  admin: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />
    </svg>
  ),
  customer: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  professional: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
};

export default function DashboardChooser({
  lang,
  title,
  subtitle,
  buttons,
  logoutLabel,
}: {
  lang: string;
  title: string;
  subtitle: string;
  buttons: ChooserButton[];
  logoutLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-field px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="rounded-xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10">
          <h1 className="text-center text-2xl font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-steel">
            {subtitle}
          </p>

          <div className="mt-8 space-y-3">
            {buttons.map((b) => (
              <a
                key={b.icon}
                href={b.href}
                className="group flex items-center gap-4 rounded-lg border border-line/60 bg-white p-4 transition hover:border-primary hover:bg-primary/5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  {ICONS[b.icon]}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {b.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {b.description}
                  </span>
                </span>
                <svg
                  className="ml-auto size-5 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(async () => await logout(lang))}
              className="h-11 rounded-lg border border-line/60 bg-white px-6 text-sm font-medium text-steel transition hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {logoutLabel}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
