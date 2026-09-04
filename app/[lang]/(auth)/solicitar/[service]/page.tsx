import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../../dictionaries";
import { getSolicitudFormData } from "../../../../actions/solicitud";
import { getSession } from "../../../../actions/auth";
import SolicitarServiceForm from "../../../../components/request/SolicitarServiceForm";

type Params = { lang: string; service: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.solicitar.meta.title,
    description: dict?.solicitar.meta.description,
  };
}

export default async function SolicitarPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { service } = await params;
  if (!service) notFound();

  const [current, dict, data, user] = await Promise.all([
    lang(),
    getDictionary(),
    getSolicitudFormData(service),
    getSession(),
  ]);

  if (!data.service) notFound();

  const locale = current ?? "es";
  const t = dict.solicitar;
  const loginDict = dict.login;

  const registerHref = `/${locale}/registro?next=/${locale}/solicitar/${data.service.slug || data.service.id}`;

  return (
    <main className="relative flex-1 overflow-hidden bg-field">
      <div className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <SolicitarServiceForm
          lang={locale}
          service={{
            id: data.service.id,
            name: data.service.name,
            slug: data.service.slug,
            description: data.service.description,
          }}
          form={data.form}
          questions={data.questions}
          registerHref={registerHref}
          isLoggedIn={Boolean(user)}
          labels={{
            badge: t.badge,
            title: t.title,
            subtitle: t.subtitle,
            requiredMark: t.requiredMark,
            stepOf: t.stepOf,
            nextButton: t.nextButton,
            backButton: t.backButton,
            optionalSectionTitle: t.optionalSectionTitle,
            cityLabel: t.cityLabel,
            cityPlaceholder: t.cityPlaceholder,
            budgetLabel: t.budgetLabel,
            budgetPlaceholder: t.budgetPlaceholder,
            sendButton: t.sendButton,
            sendPending: t.sendPending,
            savingDraft: t.savingDraft,
            checkAnswersError: t.checkAnswersError,
            loginTitle: t.loginTitle,
            loginHint: t.loginHint,
            noAccount: t.noAccount,
            registerLink: t.registerLink,
            loginButton: t.loginButton,
            loginPending: t.loginPending,
            formLostError: t.formLostError,
            successTitle: t.successTitle,
            successText: t.successText,
            viewRequests: t.viewRequests,
            backHome: t.backHome,
            submitError: t.submitError,
            noFormTitle: t.noFormTitle,
            noFormText: t.noFormText,
            backServices: t.backServices,
          }}
          loginLabels={{
            emailLabel: loginDict.emailLabel,
            emailPlaceholder: loginDict.emailPlaceholder,
            passwordLabel: loginDict.passwordLabel,
            passwordPlaceholder: loginDict.passwordPlaceholder,
            showPassword: loginDict.showPassword,
            hidePassword: loginDict.hidePassword,
          }}
        />
      </div>
    </main>
  );
}