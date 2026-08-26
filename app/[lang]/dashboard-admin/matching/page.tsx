import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import MatchingPageClient from "./MatchingPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/matching">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.matching.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function MatchingPage() {
  const dict = await getDictionary();
  return <MatchingPageClient data={dict.dashboardAdmin.matching} />;
}
