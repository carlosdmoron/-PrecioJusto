import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";
import PasswordInput from "./PasswordInput";

export default async function SignProfesionalSection() {
  const dict = await getDictionary();
  const t = dict.signProfesional;
  const current = (await lang()) ?? "es";
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] justify-end px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <a
          href={`/${current}/profesional`}
          className="inline-flex h-[38px] items-center rounded-full bg-[#EEF3FE] px-6 text-sm font-semibold text-primary transition hover:bg-chip-blue"
        >
          {t.registerButton}
        </a>
      </div>
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
