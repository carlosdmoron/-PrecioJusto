"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "it", label: "IT" },
] as const;

export default function LanguageSwitcher() {
  const pathname = usePathname() ?? "/";
  const current =
    LANGUAGES.find(
      (l) => pathname === `/${l.code}` || pathname.startsWith(`/${l.code}/`)
    )?.code ?? "es";

  return (
    <nav
      aria-label="Cambiar idioma"
      className="flex h-10 items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200"
    >
      <svg
        className="ml-2 text-gray-400"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {LANGUAGES.map(({ code, label }) => (
        <Link
          key={code}
          href={pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${code}`)}
          hrefLang={code}
          aria-current={current === code ? "true" : undefined}
          className={
            current === code
              ? "flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-white shadow-sm transition"
              : "flex h-8 items-center rounded-full px-3 text-xs font-semibold text-gray-600 transition hover:text-primary"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
