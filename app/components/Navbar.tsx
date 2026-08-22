import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary, locales } from "../[lang]/dictionaries";

const languageLabels: Record<string, string> = {
  es: "ES",
  it: "IT",
  en: "EN",
};

export default async function Navbar() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  return (
    <header className="sticky top-0 z-50 border-b border-line/20 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-6 lg:px-20">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt="PrecioJusto"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-navy">
            PrecioJusto
          </span>
        </a>
        <div className="flex items-center gap-5">
          <nav
            aria-label="Language"
            className="flex items-center gap-2 text-xs font-medium"
          >
            {locales.map((locale) => (
              <a
                key={locale}
                href={`/${locale}`}
                hrefLang={locale}
                aria-current={current === locale ? "true" : undefined}
                className={
                  current === locale
                    ? "rounded px-1.5 py-1 font-semibold text-navy"
                    : "rounded px-1.5 py-1 text-muted transition hover:text-primary"
                }
              >
                {languageLabels[locale]}
              </a>
            ))}
          </nav>
          <button
            aria-label={dict.navbar.account}
            className="grid size-8 place-items-center rounded-full bg-primary-dark text-white transition hover:bg-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
