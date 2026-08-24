import { redirect } from "next/navigation";
import { lang } from "next/root-params";

export default async function DashboardIndexPage() {
  const current = (await lang()) ?? "es";
  redirect(`/${current}/dashboard-profesional/oportunidades`);
}
