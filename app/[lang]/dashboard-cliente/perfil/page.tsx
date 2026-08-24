import { getDictionary } from "../../dictionaries";
import CustomerSectionStub from "../../../components/customer/CustomerSectionStub";

export default async function PerfilPage() {
  const dict = await getDictionary();
  const cliente = dict.dashboardCliente;
  return <CustomerSectionStub title={cliente.nav.perfil} text={cliente.stub.text} />;
}