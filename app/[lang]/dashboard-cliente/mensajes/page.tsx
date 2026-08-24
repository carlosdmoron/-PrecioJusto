import { getDictionary } from "../../dictionaries";
import CustomerSectionStub from "../../../components/customer/CustomerSectionStub";

export default async function MensajesPage() {
  const dict = await getDictionary();
  const cliente = dict.dashboardCliente;
  return <CustomerSectionStub title={cliente.nav.mensajes} text={cliente.stub.text} />;
}