import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../../dictionaries";
import { getServiceBySlug, getServices } from "../../../../actions/services";
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

  const [current, dict, serviceRow, services, user] = await Promise.all([
    lang(),
    getDictionary(),
    getServiceBySlug(service),
    getServices(),
    getSession(),
  ]);

  if (!serviceRow) notFound();

  const locale = current ?? "es";
  const t = dict.solicitar;
  const loginDict = dict.login;

  const registerHref = `/${locale}/registro`;

  return (
    <main className="relative flex-1 overflow-hidden bg-field">
      <div className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <SolicitarServiceForm
          lang={locale}
          service={{
            id: serviceRow.id,
            name: serviceRow.name,
            slug: serviceRow.slug,
            description: serviceRow.description,
          }}
          services={services.map((s) => ({ id: s.id, name: s.name }))}
          registerHref={registerHref}
          isLoggedIn={Boolean(user)}
          labels={{
            badge: t.badge,
            title: t.title,
            subtitle: t.subtitle,
            serviceLabel: t.serviceLabel,
            servicePlaceholder: t.servicePlaceholder,
            titleLabel: t.titleLabel,
            titlePlaceholder: t.titlePlaceholder,
            descriptionLabel: t.descriptionLabel,
            descriptionPlaceholder: t.descriptionPlaceholder,
            cityLabel: t.cityLabel,
            cityPlaceholder: t.cityPlaceholder,
            budgetLabel: t.budgetLabel,
            budgetPlaceholder: t.budgetPlaceholder,
            loginTitle: t.loginTitle,
            loginHint: t.loginHint,
            noAccount: t.noAccount,
            registerLink: t.registerLink,
            loginAndSubmit: t.loginAndSubmit,
            loginAndSubmitPending: t.loginAndSubmitPending,
            submit: t.submit,
            submitting: t.submitting,
            successTitle: t.successTitle,
            successText: t.successText,
            viewRequests: t.viewRequests,
            backHome: t.backHome,
            submitError: t.submitError,
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