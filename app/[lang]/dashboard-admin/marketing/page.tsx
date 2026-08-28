import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import MarketingPageClient from "./MarketingPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/marketing">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.marketing.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function MarketingPage() {
  const dict = await getDictionary();
  return <MarketingPageClient data={{ ...dict.dashboardAdmin.marketing, feedback: dict.dashboardAdmin.feedback }} />;
}
