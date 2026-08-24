import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const nav = [
    {
      href: `/${current}/dashboard-profesional/oportunidades`,
      label: dict.dashboard.nav.oportunidades,
    },
    {
      href: `/${current}/dashboard-profesional/presupuesto`,
      label: dict.dashboard.nav.presupuesto,
    },
    { href: `/${current}/dashboard-profesional/trabajo`, label: dict.dashboard.nav.trabajo },
    {
      href: `/${current}/dashboard-profesional/mis-servicios`,
      label: dict.dashboard.nav.misServicios,
    },
    {
      href: `/${current}/dashboard-profesional/billetera`,
      label: dict.dashboard.nav.billetera,
    },
    {
      href: `/${current}/dashboard-profesional/perfil`,
      label: dict.dashboard.nav.perfil,
    },
  ];

  return (
    <div className="flex min-h-screen bg-surface max-lg:flex-col">
      <DashboardSidebar
        items={nav}
        accountLabel={dict.dashboard.accountLabel}
        profileHref={`/${current}/dashboard-profesional/perfil`}
        logoutLabels={dict.sesion}
        loginHref={`/${current}/iniciar-sesion`}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
