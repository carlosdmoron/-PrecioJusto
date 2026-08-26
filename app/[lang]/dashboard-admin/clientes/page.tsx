import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ClientesPageClient from "./ClientesPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/clientes">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.clientes.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ClientesPage() {
  const dict = await getDictionary();
  return <ClientesPageClient data={dict.dashboardAdmin.clientes} />;
}
