import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { getRequests } from "../../../actions/requests";
import { getServices } from "../../../actions/services";
import CustomerRequestsReal from "../../../components/customer/CustomerRequestsReal";

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
  const requests = await getRequests();
  const services = await getServices();
  const data = dict.dashboardCliente.sections.solicitudes;

  return (
    <CustomerRequestsReal
      data={data}
      requests={requests}
      services={services}
    />
  );
}
