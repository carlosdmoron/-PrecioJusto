import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import AnaliticaPageClient from "./AnaliticaPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/analitica">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.analitica.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function AnaliticaPage() {
  const dict = await getDictionary();
  return <AnaliticaPageClient data={dict.dashboardAdmin.analitica} />;
}
