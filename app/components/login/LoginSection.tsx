import Image from "next/image";
import { redirect } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary, locales } from "../../[lang]/dictionaries";
import PasswordInput from "./PasswordInput";

const languageLabels: Record<string, string> = {
  es: "ES",
  it: "IT",
  en: "EN",
};

export default async function LoginSection() {
  const dict = await getDictionary();
  const t = dict.login;
  const current = (await lang()) ?? "es";

  async function loginToDashboard() {
    "use server";
    redirect(`/${current}/dashboard-profesional`);
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-field">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 hidden h-[576px] w-[768px] rounded-full bg-chip-blue lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-40 hidden h-[576px] w-[768px] rounded-full bg-chip-lavender lg:block"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:py-[72px]">
        <div className="mb-8 flex items-center justify-end gap-3">
          <span className="text-sm text-steel">{t.languageLabel}</span>
          <div className="flex h-11 items-center gap-3 rounded-lg bg-white px-4 shadow-sm">
            {locales.map((locale) => (
              <a
                key={locale}
                href={`/${locale}/iniciar-sesion`}
                hrefLang={locale}
                aria-current={current === locale ? "true" : undefined}
                className={
                  current === locale
                    ? "text-sm font-semibold text-primary-dark"
                    : "text-sm text-muted transition hover:text-primary"
                }
              >
                {languageLabels[locale]}
              </a>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10 md:p-12">
          <Image
            src="/images/logo.webp"
            alt="PrecioJusto"
            width={473}
            height={1024}
            className="mx-auto h-32 w-auto rounded-xl"
          />
          <h1 className="mt-8 text-center text-2xl font-bold tracking-tight text-ink">
            {t.title}
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-steel">
            {t.subtitle}
          </p>
          <form action={loginToDashboard} className="mt-10 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-ink"
              >
                {t.emailLabel}
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className="h-12 w-full rounded-lg bg-field pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <PasswordInput
              label={t.passwordLabel}
              placeholder={t.passwordPlaceholder}
              showLabel={t.showPassword}
              hideLabel={t.hidePassword}
            />
            <button
              type="submit"
              className="h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary"
            >
              {t.submitButton}
            </button>
          </form>
          <div className="my-8 h-px w-full bg-line/60" />
          <p className="text-center text-sm text-steel">
            {t.noAccount}{" "}
            <a
              href={`/${current}/registro-profesional`}
              className="font-medium text-primary-dark transition hover:text-primary"
            >
              {t.registerLink}
            </a>
          </p>
          <button
            type="button"
            className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line/60 bg-white text-sm font-medium text-ink transition hover:border-primary"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            {t.googleButton}
          </button>
        </div>
      </div>
    </main>
  );
}
