import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listClients } from "../../../actions/admin";
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
  const clients = await listClients();
  return (
    <ClientesPageClient
      data={{
        ...dict.dashboardAdmin.clientes,
        feedback: dict.dashboardAdmin.feedback,
        items: clients,
      }}
    />
  );
}
