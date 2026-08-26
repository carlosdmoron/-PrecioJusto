import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import PresupuestosPageClient from "./PresupuestosPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/presupuestos">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.presupuestos.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function PresupuestosPage() {
  const dict = await getDictionary();
  return <PresupuestosPageClient data={dict.dashboardAdmin.presupuestos} />;
}
