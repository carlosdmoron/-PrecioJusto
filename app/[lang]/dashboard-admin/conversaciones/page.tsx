import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ConversacionesPageClient from "./ConversacionesPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/conversaciones">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.conversaciones.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ConversacionesPage() {
  const dict = await getDictionary();
  return <ConversacionesPageClient data={{ ...dict.dashboardAdmin.conversaciones, feedback: dict.dashboardAdmin.feedback }} />;
}
