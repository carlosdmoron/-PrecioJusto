import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../dictionaries";
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryHero from "../../components/category/CategoryHero";
import ServiceGrid from "../../components/category/ServiceGrid";
import AllServices from "../../components/category/AllServices";
import CategoryFooter from "../../components/category/CategoryFooter";

const SERVICE_IMAGES = [
  "/images/renovacion/108990-reformas-integrales.jpeg",
  "/images/renovacion/02045-ev-tadilat.jpg",
  "/images/renovacion/00567-renovari-apartamente.jpg",
  "/images/renovacion/00552-banyo-tadilat.jpg",
  "/images/renovacion/01857-stolarskie.jpg",
  "/images/renovacion/00524-zidar.jpg",
  "/images/renovacion/16322-painter-and-decorator.jpg",
  "/images/renovacion/06096-ristrutturazione-completa-bagno.jpg",
  "/images/renovacion/00032-boyaci-boya-badana-ustasi.jpg",
  "/images/renovacion/112854-lavori-di-muratura.jpeg",
  "/images/renovacion/005958-reforma-integral-piso.jpg",
  "/images/renovacion/76657-tavan-vantilatoru-montaji.jpg",
];

const HERO_IMAGE = "/images/renovacion/grup-usta-ve-insaat_1.jpg";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/renovacion">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.renovacion.meta.title,
    description: dict?.renovacion.meta.description,
  };
}

export default async function RenovacionPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const { renovacion } = dict;
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <CategoryHeader header={renovacion.header} lang={current} />
      <main className="flex-1">
        <CategoryHero hero={renovacion.hero} image={HERO_IMAGE} />
        <ServiceGrid
          popularTitle={renovacion.popularTitle}
          services={renovacion.services}
          quoteButton={renovacion.quoteButton}
          images={SERVICE_IMAGES}
        />
        <AllServices title={renovacion.allServicesTitle} services={renovacion.allServices} />
      </main>
      <CategoryFooter footer={renovacion.footer} lang={current} />
    </div>
  );
}
