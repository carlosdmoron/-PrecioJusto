import { redirect } from "next/navigation";
import { lang } from "next/root-params";

export default async function AdminIndexPage() {
  const current = (await lang()) ?? "es";
  redirect(`/${current}/dashboard-admin/resumen`);
}
