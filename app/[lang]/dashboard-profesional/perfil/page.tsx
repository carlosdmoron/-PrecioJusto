import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ProfileForm from "../../../components/dashboard/ProfileForm";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-profesional/perfil">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboard.meta.title,
    description: dict?.dashboard.meta.description,
  };
}

export default async function PerfilPage() {
  const dict = await getDictionary();
  const section = dict.dashboard.sections.perfil;
  return (
    <div className="mx-auto w-full max-w-[1024px] px-6 py-10 lg:px-10">
      <header>
        <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
          {section.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{section.subtitle}</p>
      </header>
      <ProfileForm form={section.form} />
    </div>
  );
}
