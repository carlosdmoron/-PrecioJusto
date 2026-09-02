import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listTickets } from "../../../actions/admin";
import SoportePageClient from "./SoportePageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/soporte">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.soporte.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function SoportePage() {
  const dict = await getDictionary();
  let items: any[] = [];
  try {
    items = await listTickets();
  } catch (e) {
    console.error("Error cargando tickets:", e);
  }
  return (
    <SoportePageClient data={{ ...dict.dashboardAdmin.soporte, items, feedback: dict.dashboardAdmin.feedback }} />
  );
}
