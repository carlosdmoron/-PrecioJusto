import { redirect } from "next/navigation";
import { lang } from "next/root-params";
import { getDictionary } from "../dictionaries";
import { createClient } from "../../../lib/supabase/server";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import SetPasswordModal from "../../components/dashboard/SetPasswordModal";

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

  // La columna must_set_password existe desde la migración 0014; si aún no está
  // aplicada el popup de "crear contraseña" simplemente no se muestra.
  const { error: pwdProbe } = await supabase
    .from("profiles")
    .select("must_set_password")
    .limit(1);
  const hasMustSetPassword = !pwdProbe;
  const profileSelect = hasMustSetPassword ? "status, must_set_password" : "status";
  const { data: profile } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle();
  const profileRow = profile as { status?: string | null; must_set_password?: boolean } | null;

  const blocked =
    prof?.admin_status === "blocked" ||
    profileRow?.status === "banned" ||
    profileRow?.status === "blocked";
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

  const showSetPassword = Boolean(profileRow?.must_set_password);

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
      {showSetPassword ? (
        <SetPasswordModal
          labels={{
            title: dict.dashboard.setPassword.title,
            subtitle: dict.dashboard.setPassword.subtitle,
            passwordLabel: dict.dashboard.setPassword.passwordLabel,
            passwordPlaceholder: dict.dashboard.setPassword.passwordPlaceholder,
            confirmLabel: dict.dashboard.setPassword.confirmLabel,
            confirmPlaceholder: dict.dashboard.setPassword.confirmPlaceholder,
            mismatch: dict.dashboard.setPassword.mismatch,
            tooShort: dict.dashboard.setPassword.tooShort,
            submit: dict.dashboard.setPassword.submit,
            submitting: dict.dashboard.setPassword.submitting,
            success: dict.dashboard.setPassword.success,
            error: dict.dashboard.setPassword.error,
            closeLabel: dict.dashboard.closeLabel,
          }}
        />
      ) : null}
    </div>
  );
}
