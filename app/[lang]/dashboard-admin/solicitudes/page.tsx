import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listRequests } from "../../../actions/admin";
import SolicitudesPageClient from "./SolicitudesPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/solicitudes">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.solicitudes.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function SolicitudesPage() {
  const dict = await getDictionary();
  const items = await listRequests();
  return (
    <SolicitudesPageClient data={{ ...dict.dashboardAdmin.solicitudes, items, feedback: dict.dashboardAdmin.feedback }} />
  );
}
