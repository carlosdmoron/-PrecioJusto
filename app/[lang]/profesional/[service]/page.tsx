import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { getProfesionalFormData, hasProfesionalForService } from "../../../actions/profesional";
import { getSession } from "../../../actions/auth";
import ProfesionalForm from "../../../components/professional/ProfesionalForm";

type Params = { lang: string; service: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.profRegistro.meta.title,
    description: dict?.profRegistro.meta.description,
  };
}

export default async function ProfRegistroPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { service: serviceKey } = await params;
  if (!serviceKey) notFound();

  const current = (await lang()) ?? "es";
  const locale = current as "es" | "it" | "en";

  const dict = await getDictionary();
  const [data, user] = await Promise.all([
    getProfesionalFormData(serviceKey, locale),
    getSession(),
  ]);

  if (!data.service) notFound();

  const isRegistered = user
    ? await hasProfesionalForService(data.service.id)
    : false;

  const t = dict.profRegistro;

  return (
    <main className="relative flex-1 overflow-hidden bg-field">
      <div className="relative mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <ProfesionalForm
          lang={locale}
          service={{
            id: data.service.id,
            name: data.service.name,
            slug: data.service.slug,
            description: data.service.description,
          }}
          form={data.form}
          questions={data.questions}
          isLoggedIn={Boolean(user)}
          isRegistered={isRegistered}
          labels={{
            badge: t.badge,
            title: t.title,
            subtitle: t.subtitle,
            requiredMark: t.requiredMark,
            stepOf: t.stepOf,
            nextButton: t.nextButton,
            backButton: t.backButton,
            accountSectionTitle: t.accountSectionTitle,
            firstNameLabel: t.firstNameLabel,
            firstNamePlaceholder: t.firstNamePlaceholder,
            lastNameLabel: t.lastNameLabel,
            lastNamePlaceholder: t.lastNamePlaceholder,
            phoneLabel: t.phoneLabel,
            phonePlaceholder: t.phonePlaceholder,
            emailLabel: t.emailLabel,
            emailPlaceholder: t.emailPlaceholder,
            submitButton: t.submitButton,
            submitPending: t.submitPending,
            checkAnswersError: t.checkAnswersError,
            invalidEmail: t.invalidEmail,
            emailInUse: t.emailInUse,
            duplicateError: t.duplicateError,
            alreadyTitle: t.alreadyTitle,
            alreadyText: t.alreadyText,
            goDashboard: t.goDashboard,
            noFormTitle: t.noFormTitle,
            noFormText: t.noFormText,
            backHome: t.backHome,
            successTitle: t.successTitle,
            successText: t.successText,
            submitError: t.submitError,
            attachPhotoButton: t.attachPhotoButton,
            attachPhotoHint: t.attachPhotoHint,
            uploadingPhoto: t.uploadingPhoto,
            removePhoto: t.removePhoto,
            invalidFileType: t.invalidFileType,
            fileTooLarge: t.fileTooLarge,
            uploadFailed: t.uploadFailed,
          }}
        />
      </div>
    </main>
  );
}