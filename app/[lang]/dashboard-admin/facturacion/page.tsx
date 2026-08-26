import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import FacturacionPageClient from "./FacturacionPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/facturacion">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.facturacion.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function FacturacionPage() {
  const dict = await getDictionary();
  return <FacturacionPageClient data={dict.dashboardAdmin.facturacion} />;
}
