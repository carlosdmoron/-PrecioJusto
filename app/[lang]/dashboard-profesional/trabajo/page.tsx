import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import DashboardSection from "../../../components/dashboard/DashboardSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-profesional/trabajo">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboard.meta.title,
    description: dict?.dashboard.meta.description,
  };
}

export default async function TrabajoPage() {
  const dict = await getDictionary();
  const section = dict.dashboard.sections.trabajo;
  return (
    <DashboardSection
      title={section.title}
      subtitle={section.subtitle}
      items={section.items}
      variant="status"
      form={section.form}
    />
  );
}
