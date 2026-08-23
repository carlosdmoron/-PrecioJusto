import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary, locales } from "../../[lang]/dictionaries";
import PasswordInput from "./PasswordInput";

const languageLabels: Record<string, string> = {
  es: "ES",
  it: "IT",
  en: "EN",
};

export default async function SignProfesionalSection() {
  const dict = await getDictionary();
  const t = dict.signProfesional;
  const current = (await lang()) ?? "es";
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-[65px] w-full max-w-[1280px] items-center gap-8 px-6 lg:px-10">
          <a href={`/${current}`} className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="PrecioJusto"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              PrecioJusto
            </span>
          </a>
          <span aria-hidden="true" className="hidden h-5 w-px bg-gray-300 sm:block" />
          <nav className="hidden items-center gap-8 sm:flex">
            <a
              href="#"
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              {t.nav.categories}
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              {t.nav.stores}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <nav
              aria-label="Language"
              className="hidden items-center gap-2 text-xs font-medium md:flex"
            >
              {locales.map((locale) => (
                <a
                  key={locale}
                  href={`/${locale}/registro-profesional`}
                  hrefLang={locale}
                  aria-current={current === locale ? "true" : undefined}
                  className={
                    current === locale
                      ? "rounded px-1.5 py-1 font-semibold text-gray-900"
                      : "rounded px-1.5 py-1 text-gray-400 transition hover:text-primary"
                  }
                >
                  {languageLabels[locale]}
                </a>
              ))}
            </nav>
            <a
              href={`/${current}/iniciar-sesion`}
              className="inline-flex h-[38px] items-center rounded-full bg-[#EEF3FE] px-6 text-sm font-semibold text-primary transition hover:bg-chip-blue"
            >
              {t.nav.signin}
            </a>
          </div>
        </div>
      </header>
      <main className="flex justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-[512px] rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-[42px]">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            {t.subtitle}
          </p>
          <form action="#" className="mt-9 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                {t.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t.emailPlaceholder}
                className="h-[49px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <PasswordInput
              label={t.passwordLabel}
              placeholder={t.passwordPlaceholder}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
          </form>
          <p className="mt-7 text-sm text-gray-900">
            {t.haveAccount}{" "}
            <a
              href={`/${current}/iniciar-sesion`}
              className="font-medium underline underline-offset-2 transition hover:text-primary"
            >
              {t.loginLink}
            </a>
          </p>
          <div className="my-7 flex items-center gap-4" role="separator">
            <span aria-hidden="true" className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">{t.or}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="submit"
            className="h-[52px] w-full rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t.submitButton}
          </button>
        </div>
      </main>
    </div>
  );
}
