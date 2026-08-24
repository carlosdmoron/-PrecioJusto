import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import DashboardSection from "../../../components/dashboard/DashboardSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-profesional/oportunidades">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboard.meta.title,
    description: dict?.dashboard.meta.description,
  };
}

export default async function OportunidadesPage() {
  const dict = await getDictionary();
  const section = dict.dashboard.sections.oportunidades;
  return (
    <DashboardSection
      title={section.title}
      subtitle={section.subtitle}
      items={section.items}
      variant="quote"
      form={section.form}
    />
  );
}
