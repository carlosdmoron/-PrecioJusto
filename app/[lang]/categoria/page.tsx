import type { Metadata } from "next";
import { getDictionaryByLocale } from "../dictionaries";
import CategoriaHeader from "../../components/categoria/CategoriaHeader";
import CategoriaHero from "../../components/categoria/CategoriaHero";
import ServiceGrid from "../../components/categoria/ServiceGrid";
import AllServices from "../../components/categoria/AllServices";
import CategoriaFooter from "../../components/categoria/CategoriaFooter";

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

export default function CategoriaPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <CategoriaHeader />
      <main className="flex-1">
        <CategoriaHero />
        <ServiceGrid />
        <AllServices />
      </main>
      <CategoriaFooter />
    </div>
  );
}
