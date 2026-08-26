import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import AdminToastWrapper from "./AdminToastWrapper";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const admin = dict.dashboardAdmin;
  const nav = [
    { href: `/${current}/dashboard-admin/resumen`, label: admin.nav.resumen },
    { href: `/${current}/dashboard-admin/servicios`, label: admin.nav.servicios },
    { href: `/${current}/dashboard-admin/formularios`, label: admin.nav.formularios },
    { href: `/${current}/dashboard-admin/solicitudes`, label: admin.nav.solicitudes },
    { href: `/${current}/dashboard-admin/matching`, label: admin.nav.matching },
    { href: `/${current}/dashboard-admin/profesionales`, label: admin.nav.profesionales },
    { href: `/${current}/dashboard-admin/presupuestos`, label: admin.nav.presupuestos },
    { href: `/${current}/dashboard-admin/clientes`, label: admin.nav.clientes },
    { href: `/${current}/dashboard-admin/conversaciones`, label: admin.nav.conversaciones },
    { href: `/${current}/dashboard-admin/trabajos`, label: admin.nav.trabajos },
    { href: `/${current}/dashboard-admin/resenas`, label: admin.nav.resenas },
    { href: `/${current}/dashboard-admin/facturacion`, label: admin.nav.facturacion },
    { href: `/${current}/dashboard-admin/marketing`, label: admin.nav.marketing },
    { href: `/${current}/dashboard-admin/notificaciones`, label: admin.nav.notificaciones },
    { href: `/${current}/dashboard-admin/soporte`, label: admin.nav.soporte },
    { href: `/${current}/dashboard-admin/analitica`, label: admin.nav.analitica },
    { href: `/${current}/dashboard-admin/configuracion`, label: admin.nav.configuracion },
  ];

  return (
    <div className="flex min-h-screen bg-surface max-lg:flex-col">
      <DashboardSidebar
        items={nav}
        accountLabel={admin.accountLabel}
        profileHref={`/${current}/dashboard-admin/configuracion`}
        logoutLabels={dict.sesion}
        loginHref={`/${current}/iniciar-sesion`}
      />
      <main className="min-w-0 flex-1"><AdminToastWrapper>{children}</AdminToastWrapper></main>
    </div>
  );
}
