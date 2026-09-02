import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listServices, listCategories } from "../../../actions/admin";
import ServiciosPageClient from "./ServiciosPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/servicios">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.servicios.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ServiciosPage() {
  const dict = await getDictionary();
  let services: any[] = [];
  let categories: any[] = [];
  try {
    [services, categories] = await Promise.all([listServices(), listCategories()]);
  } catch (e) {
    console.error("Error cargando servicios:", e);
  }
  return (
    <ServiciosPageClient
      data={{
        ...dict.dashboardAdmin.servicios,
        feedback: dict.dashboardAdmin.feedback,
        items: services,
        categories,
      }}
    />
  );
}
