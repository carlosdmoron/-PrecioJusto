import { redirect } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import { createClient } from "../../../lib/supabase/server";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const loginHref = `/${current}/iniciar-sesion`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginHref);
  }

  // Guard central: si el profesional fue bloqueado, se cierra su sesión y se le
  // saca del dashboard (no puede usarlo ni acceder por URL directa).
  const { data: prof } = await supabase
    .from("professionals")
    .select("admin_status")
    .eq("id", user.id)
    .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .maybeSingle();

  const blocked =
    prof?.admin_status === "blocked" ||
    profile?.status === "banned" ||
    profile?.status === "blocked";
  if (blocked) {
    await supabase.auth.signOut();
    redirect(loginHref);
  }

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
        loginHref={loginHref}
      />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
