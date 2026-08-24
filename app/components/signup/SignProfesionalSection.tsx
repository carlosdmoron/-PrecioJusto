import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";
import SignupWizard from "./SignupWizard";

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
          <SignupWizard
            onboarding={t.onboarding}
            dashboardHref={`/${current}/dashboard-profesional`}
          />
        </div>
      </main>
      <div className="mx-auto w-full max-w-[512px] px-4 pb-16 text-center">
        <p className="text-sm text-gray-900">
          {t.haveAccount}{" "}
          <a
            href={`/${current}/iniciar-sesion`}
            className="font-medium underline underline-offset-2 transition hover:text-primary"
          >
            {t.loginLink}
          </a>
        </p>
      </div>
    </div>
  );
}
