import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ResenasPageClient from "./ResenasPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/resenas">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.resenas.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ResenasPage() {
  const dict = await getDictionary();
  return <ResenasPageClient data={dict.dashboardAdmin.resenas} />;
}
