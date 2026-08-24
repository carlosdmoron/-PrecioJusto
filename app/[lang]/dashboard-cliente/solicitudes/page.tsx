import { getDictionary } from "../../dictionaries";
import CustomerSectionStub from "../../../components/customer/CustomerSectionStub";

export default async function SolicitudesPage() {
  const dict = await getDictionary();
  const cliente = dict.dashboardCliente;
  return <CustomerSectionStub title={cliente.nav.solicitudes} text={cliente.stub.text} />;
}