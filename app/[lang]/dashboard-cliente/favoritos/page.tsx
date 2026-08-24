import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import FavoritesSection from "../../../components/customer/FavoritesSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-cliente/favoritos">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardCliente.sections.favoritos.title,
    description: dict?.dashboardCliente.meta.description,
  };
}

export default async function FavoritosPage() {
  const dict = await getDictionary();
  return <FavoritesSection data={dict.dashboardCliente.sections.favoritos} />;
}
