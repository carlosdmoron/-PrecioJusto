import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import CustomerRequestsSection from "../../../components/customer/CustomerRequestsSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-cliente/solicitudes">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardCliente.sections.solicitudes.title,
    description: dict?.dashboardCliente.meta.description,
  };
}

export default async function SolicitudesPage() {
  const dict = await getDictionary();
  return <CustomerRequestsSection data={dict.dashboardCliente.sections.solicitudes} />;
}
