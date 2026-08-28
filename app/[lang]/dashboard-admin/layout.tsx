import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import { createClient } from "../../../lib/supabase/server";
import DashboardSidebar, {
  type DashboardNavGroup,
} from "../../components/dashboard/DashboardSidebar";
import AdminTopBar from "../../components/admin/AdminTopBar";
import AdminToastWrapper from "./AdminToastWrapper";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const admin = dict.dashboardAdmin;
  const ui = admin.ui;
  const nav = admin.nav;

  const groups: DashboardNavGroup[] = [
    {
      label: ui.sections.general,
      items: [{ href: `/${current}/dashboard-admin/resumen`, label: nav.resumen }],
    },
    {
      label: ui.sections.operaciones,
      items: [
        { href: `/${current}/dashboard-admin/solicitudes`, label: nav.solicitudes },
        { href: `/${current}/dashboard-admin/matching`, label: nav.matching },
        { href: `/${current}/dashboard-admin/presupuestos`, label: nav.presupuestos },
        { href: `/${current}/dashboard-admin/trabajos`, label: nav.trabajos },
      ],
    },
    {
      label: ui.sections.clientes,
      items: [
        { href: `/${current}/dashboard-admin/clientes`, label: nav.clientes },
        { href: `/${current}/dashboard-admin/conversaciones`, label: nav.conversaciones },
      ],
    },
    {
      label: ui.sections.profesionales,
      items: [
        { href: `/${current}/dashboard-admin/profesionales`, label: nav.profesionales },
        { href: `/${current}/dashboard-admin/servicios`, label: nav.servicios },
        { href: `/${current}/dashboard-admin/formularios`, label: nav.formularios },
      ],
    },
  ];

  let userName: string | null = null;
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userName = user?.user_metadata?.name ?? null;
    userEmail = user?.email ?? null;
  } catch {
    // layout de solo lectura: si falla la sesión se muestra el fallback
  }

  return (
    <div className="flex min-h-screen bg-pj-bg max-lg:flex-col">
      <DashboardSidebar
        items={[]}
        groups={groups}
        accountLabel={admin.accountLabel}
        profileHref={`/${current}/dashboard-admin/configuracion`}
        logoutLabels={dict.sesion}
        loginHref={`/${current}/iniciar-sesion`}
      />
      <div className="min-w-0 flex-1">
        <AdminTopBar
          groups={groups}
          rootLabel={ui.rootLabel}
          helpHref={`/${current}/dashboard-admin/soporte`}
          profileHref={`/${current}/dashboard-admin/configuracion`}
          userName={userName}
          userEmail={userEmail}
          notifications={ui.notificationItems}
          texts={{
            help: ui.help,
            notifications: ui.notifications,
            notificationsEmpty: ui.notificationsEmpty,
            account: ui.account,
            settings: ui.settings,
            logout: ui.logout,
          }}
          logoutLabels={dict.sesion}
          loginHref={`/${current}/iniciar-sesion`}
        />
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <AdminToastWrapper>{children}</AdminToastWrapper>
        </main>
      </div>
    </div>
  );
}