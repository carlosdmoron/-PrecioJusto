import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ProfesionalesPageClient from "./ProfesionalesPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/profesionales">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.profesionales.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ProfesionalesPage() {
  const dict = await getDictionary();
  return <ProfesionalesPageClient data={dict.dashboardAdmin.profesionales} />;
}
