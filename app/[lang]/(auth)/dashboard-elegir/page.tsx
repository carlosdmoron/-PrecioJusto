import type { Metadata } from "next";
import { lang } from "next/root-params";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { shouldShowDashboardChooser } from "../../../../lib/guards";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import DashboardChooser from "../../../components/login/DashboardChooser";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-elegir">): Promise<Metadata> {
  const { lang: locale } = await params;
  const dict = await getDictionaryByLocale(locale);
  return {
    title: dict?.login.meta.title,
    description: dict?.login.meta.description,
  };
}

export default async function DashboardElegirPage() {
  const current = (await lang()) ?? "es";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !shouldShowDashboardChooser(user.email)) {
    redirect(`/${current}/iniciar-sesion`);
  }

  const dict = await getDictionary();
  const t = dict.dashboardChooser;

  return (
    <DashboardChooser
      lang={current}
      title={t.title}
      subtitle={t.subtitle}
      buttons={[
        {
          label: t.admin,
          description: t.adminDesc,
          href: `/${current}/dashboard-admin`,
          icon: "admin",
        },
        {
          label: t.customer,
          description: t.customerDesc,
          href: `/${current}/dashboard-cliente`,
          icon: "customer",
        },
        {
          label: t.professional,
          description: t.professionalDesc,
          href: `/${current}/dashboard-profesional`,
          icon: "professional",
        },
      ]}
      logoutLabel={t.logout}
    />
  );
}
