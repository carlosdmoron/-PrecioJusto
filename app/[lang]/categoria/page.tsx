import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../dictionaries";
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryHero from "../../components/category/CategoryHero";
import ServiceGrid from "../../components/category/ServiceGrid";
import AllServices from "../../components/category/AllServices";
import CategoryFooter from "../../components/category/CategoryFooter";

const SERVICE_IMAGES = [
  "/images/categoria/108464-nutricionista.jpeg",
  "/images/categoria/108481-entrenador-personal.jpeg",
  "/images/categoria/108666-psicologo.jpeg",
  "/images/categoria/108470-psicoterapia.jpg",
  "/images/categoria/00692-online-diyetisyen.jpg",
  "/images/categoria/109144-psiquiatra.jpeg",
  "/images/categoria/00515-online-psikolog.jpg",
  "/images/categoria/108465-dietista.jpg",
  "/images/categoria/109162-entrenador-a-domicilio.jpg",
  "/images/categoria/109023-fisioterapia-a-domicilio.jpeg",
  "/images/categoria/108475-fisioterapeuta.jpeg",
  "/images/categoria/109320-entrenador-personal-online.jpeg",
];

const HERO_IMAGE = "/images/categoria/hero-personal-trainer.jpg";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/categoria">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.categoria.meta.title,
    description: dict?.categoria.meta.description,
  };
}

export default async function CategoriaPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const { categoria } = dict;
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <CategoryHeader header={categoria.header} lang={current} />
      <main className="flex-1">
        <CategoryHero hero={categoria.hero} image={HERO_IMAGE} />
        <ServiceGrid
          popularTitle={categoria.popularTitle}
          services={categoria.services}
          quoteButton={categoria.quoteButton}
          images={SERVICE_IMAGES}
        />
        <AllServices title={categoria.allServicesTitle} services={categoria.allServices} />
      </main>
      <CategoryFooter footer={categoria.footer} lang={current} />
    </div>
  );
}
