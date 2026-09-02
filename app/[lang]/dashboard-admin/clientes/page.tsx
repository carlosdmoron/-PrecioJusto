import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { listClients } from "../../../actions/admin";
import ClientesPageClient from "./ClientesPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/clientes">): Promise<Metadata> {
  const { lang } = await params;
  console.log("Generating metadata for", lang);
  console.log("Fetching dictionary for locale:", lang);
  const dict = await getDictionaryByLocale(lang);
  console.log("Dictionary loaded:", dict ? "OK" : "ERROR");
  return {
    title: dict?.dashboardAdmin.clientes.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ClientesPage() {
  try {
    console.log("Loading dashboard admin clientes page");
    const dict = await getDictionary();
    console.log("Dictionary loaded successfully");
    const clients = await listClients();
    console.log("Clients fetched successfully, count:", clients.length);
    return (
      <ClientesPageClient
        data={{
          ...dict.dashboardAdmin.clientes,
          feedback: dict.dashboardAdmin.feedback,
          items: clients,
        }}
      />
    );
  } catch (error) {
    console.error("Error loading dashboard admin clientes page:", error);
    throw error;
  }
}
