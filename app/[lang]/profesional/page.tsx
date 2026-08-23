import type { Metadata } from "next";
import { getDictionaryByLocale } from "../dictionaries";
import ProfLogoHeader from "../../components/professional/ProfLogoHeader";
import ProfHero from "../../components/professional/ProfHero";
import ProfFeatures from "../../components/professional/ProfFeatures";
import ProfProcess from "../../components/professional/ProfProcess";
import ProfServices from "../../components/professional/ProfServices";
import ProfCta from "../../components/professional/ProfCta";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/profesional">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.profesional.meta.title,
    description: dict?.profesional.meta.description,
  };
}

export default function ProfesionalPage() {
  return (
    <div className="relative">
      <ProfLogoHeader />
      <main className="flex-1">
        <ProfHero />
        <ProfFeatures />
        <ProfProcess />
        <ProfServices />
        <ProfCta />
      </main>
    </div>
  );
}
