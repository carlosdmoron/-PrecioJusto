import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import SoportePageClient from "./SoportePageClient";

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
  return <SoportePageClient data={dict.dashboardAdmin.soporte} />;
}
