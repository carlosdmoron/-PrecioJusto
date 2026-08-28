import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { createClient } from "../../../../lib/supabase/server";
import ResumenPageClient from "./ResumenPageClient";
import type { FilterField } from "../../../components/admin/FilterBar";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/resumen">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.meta.title,
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function ResumenPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const { resumen, ui } = dict.dashboardAdmin;

  const filters: FilterField[] = [
    { key: "fecha", label: resumen.filters.fecha, type: "date" },
    { key: "pais", label: resumen.filters.pais, type: "select", options: [{ value: "es", label: "España" }, { value: "it", label: "Italia" }], placeholder: "Todos" },
    { key: "ciudad", label: resumen.filters.ciudad, type: "text", placeholder: "Ciudad" },
    { key: "categoria", label: resumen.filters.categoria, type: "select", options: [{ value: "plomeria", label: "Plomería" }, { value: "pintura", label: "Pintura" }, { value: "jardineria", label: "Jardinería" }], placeholder: "Todas" },
    { key: "dispositivo", label: resumen.filters.dispositivo, type: "select", options: [{ value: "mobile", label: "Móvil" }, { value: "desktop", label: "Escritorio" }], placeholder: "Todos" },
    { key: "canal", label: resumen.filters.canal, type: "select", options: [{ value: "organic", label: "Orgánico" }, { value: "paid", label: "Pago" }, { value: "direct", label: "Directo" }], placeholder: "Todos" },
  ];

  let userName: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? null;
  } catch {
    // sin sesión: saludo genérico
  }

  return (
    <ResumenPageClient
      userName={userName}
      stats={resumen.stats}
      alerts={resumen.alerts}
      filters={filters}
      filterLabels={{ apply: resumen.filters.aplicar, clear: resumen.filters.limpiar }}
      ui={ui}
      solicitudesHref={`/${current}/dashboard-admin/solicitudes`}
    />
  );
}
