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
          <a
            href={`/${current}/profesional`}
            className="hidden text-sm font-medium text-steel transition hover:text-primary sm:block"
          >
            {dict.navbar.professional}
          </a>
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
          <a
            href={`/${current}/iniciar-sesion`}
            className="inline-flex h-10 items-center rounded-lg bg-primary-dark px-5 text-sm font-semibold text-white transition hover:bg-primary"
          >
            {dict.navbar.signin}
          </a>
        </div>
      </div>
    </header>
  );
}
