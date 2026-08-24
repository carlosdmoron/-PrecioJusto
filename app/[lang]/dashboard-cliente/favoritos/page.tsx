import { getDictionary } from "../../dictionaries";
import CustomerSectionStub from "../../../components/customer/CustomerSectionStub";

export default async function FavoritosPage() {
  const dict = await getDictionary();
  const cliente = dict.dashboardCliente;
  return <CustomerSectionStub title={cliente.nav.favoritos} text={cliente.stub.text} />;
}