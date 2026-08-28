import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import NotificacionesPageClient from "./NotificacionesPageClient";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/notificaciones">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.notificaciones.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function NotificacionesPage() {
  const dict = await getDictionary();
  return <NotificacionesPageClient data={{ ...dict.dashboardAdmin.notificaciones, feedback: dict.dashboardAdmin.feedback }} />;
}
