import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import TrabajosPageClient from "./TrabajosPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/trabajos">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.trabajos.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function TrabajosPage() {
  const dict = await getDictionary();
  return <TrabajosPageClient data={{ ...dict.dashboardAdmin.trabajos, feedback: dict.dashboardAdmin.feedback }} />;
}
