import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ConfiguracionPageClient from "./ConfiguracionPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/configuracion">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.configuracion.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ConfiguracionPage() {
  const dict = await getDictionary();
  return <ConfiguracionPageClient data={dict.dashboardAdmin.configuracion} />;
}
