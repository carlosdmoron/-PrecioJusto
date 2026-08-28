import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import FormulariosPageClient from "./FormulariosPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/formularios">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.formularios.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function FormulariosPage() {
  const dict = await getDictionary();
  return <FormulariosPageClient data={{ ...dict.dashboardAdmin.formularios, feedback: dict.dashboardAdmin.feedback }} />;
}
