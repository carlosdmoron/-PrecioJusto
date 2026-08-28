import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listProfessionals } from "../../../actions/admin";
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
  const items = await listProfessionals();
  return (
    <ProfesionalesPageClient data={{ ...dict.dashboardAdmin.profesionales, items, feedback: dict.dashboardAdmin.feedback }} />
  );
}
