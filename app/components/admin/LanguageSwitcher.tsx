"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LANGUAGES = [
  { code: "es", label: "ES", flag: "🇪🇸", name: "Español" },
  { code: "en", label: "EN", flag: "🇬🇧", name: "English" },
  { code: "it", label: "IT", flag: "🇮🇹", name: "Italiano" },
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
      className="flex h-9 items-center gap-0.5 rounded-full border border-pj-border bg-white/70 p-1 shadow-sm backdrop-blur transition"
    >
      {LANGUAGES.map(({ code, label, flag, name }) => {
        const active = current === code;
        return (
          <Link
            key={code}
            href={pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${code}`)}
            hrefLang={code}
            title={name}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "flex h-7 items-center gap-1.5 rounded-full bg-pj-primary px-2.5 text-xs font-semibold text-white shadow-sm transition"
                : "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
            }
          >
            <span aria-hidden="true" className="text-sm leading-none">{flag}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
