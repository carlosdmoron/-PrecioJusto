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
    <header className="absolute inset-x-0 top-0 z-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent"
      />
      <div className="relative mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-6 lg:px-20">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt="PrecioJusto"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight text-white drop-shadow-md">
            PrecioJusto
          </span>
        </a>
        <div className="flex items-center gap-5">
          <a
            href={`/${current}/categoria`}
            className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block"
          >
            {dict.navbar.category}
          </a>
          <a
            href={`/${current}/profesional`}
            className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block"
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
                    ? "rounded px-1.5 py-1 font-semibold text-white drop-shadow-sm"
                    : "rounded px-1.5 py-1 text-white/70 transition hover:text-white"
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
