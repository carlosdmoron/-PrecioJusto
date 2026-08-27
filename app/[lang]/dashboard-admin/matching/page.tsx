import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listMatchingRules } from "../../../actions/admin";
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
  const items = await listMatchingRules();
  return (
    <MatchingPageClient data={{ ...dict.dashboardAdmin.matching, items }} />
  );
}
