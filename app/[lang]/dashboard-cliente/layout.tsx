import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerTopbar from "../../components/customer/CustomerTopbar";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const cliente = dict.dashboardCliente;
  const nav = [
    { href: `/${current}/dashboard-cliente`, label: cliente.nav.inicio },
    { href: `/${current}/dashboard-cliente/solicitudes`, label: cliente.nav.solicitudes },
    { href: `/${current}/dashboard-cliente/mensajes`, label: cliente.nav.mensajes },
    { href: `/${current}/dashboard-cliente/favoritos`, label: cliente.nav.favoritos },
    { href: `/${current}/dashboard-cliente/perfil`, label: cliente.nav.perfil },
  ];

  return (
    <div className="flex min-h-screen bg-canvas max-lg:flex-col">
      <CustomerSidebar items={nav} promo={cliente.promo} logoAlt="PrecioJusto" />
      <div className="min-w-0 flex-1">
        <CustomerTopbar greeting={cliente.greeting} avatarLabel={cliente.avatarLabel} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
