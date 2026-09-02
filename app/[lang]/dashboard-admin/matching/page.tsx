import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import {
  listMatchingRules,
  listMatchingCandidates,
  listServicesForSimulator,
} from "../../../actions/admin";
import MatchingPageClient from "./MatchingPageClient";

export const dynamic = "force-dynamic";

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
  const [items, candidates, services] = await Promise.all([
    listMatchingRules().catch(() => []),
    listMatchingCandidates().catch(() => []),
    listServicesForSimulator().catch(() => []),
  ]);
  return (
    <MatchingPageClient
      data={{
        ...dict.dashboardAdmin.matching,
        items,
        candidates,
        services,
        feedback: dict.dashboardAdmin.feedback,
      }}
    />
  );
}
