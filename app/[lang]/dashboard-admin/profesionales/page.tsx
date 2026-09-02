import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listProfessionals } from "../../../actions/admin";
import ProfesionalesPageClient from "./ProfesionalesPageClient";

export const dynamic = "force-dynamic";

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
  let items: any[] = [];
  try {
    items = await listProfessionals();
  } catch (e) {
    console.error("Error cargando profesionales:", e);
  }
  return (
    <ProfesionalesPageClient data={{ ...dict.dashboardAdmin.profesionales, items, feedback: dict.dashboardAdmin.feedback }} />
  );
}
