import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import AdminSection from "../../../components/admin/AdminSection";
import StatCard, { type StatCardData } from "../../../components/admin/StatCard";
import AlertCard, { type AlertCardData } from "../../../components/admin/AlertCard";
import FilterBar from "../../../components/admin/FilterBar";
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
  const { resumen } = dict.dashboardAdmin;

  const filters: FilterField[] = [
    { key: "fecha", label: resumen.filters.fecha, type: "date" },
    { key: "pais", label: resumen.filters.pais, type: "select", options: [{ value: "es", label: "España" }, { value: "it", label: "Italia" }], placeholder: "Todos" },
    { key: "ciudad", label: resumen.filters.ciudad, type: "text", placeholder: "Ciudad" },
    { key: "categoria", label: resumen.filters.categoria, type: "select", options: [{ value: "plomeria", label: "Plomería" }, { value: "pintura", label: "Pintura" }, { value: "jardineria", label: "Jardinería" }], placeholder: "Todas" },
    { key: "dispositivo", label: resumen.filters.dispositivo, type: "select", options: [{ value: "mobile", label: "Móvil" }, { value: "desktop", label: "Escritorio" }], placeholder: "Todos" },
    { key: "canal", label: resumen.filters.canal, type: "select", options: [{ value: "organic", label: "Orgánico" }, { value: "paid", label: "Pago" }, { value: "direct", label: "Directo" }], placeholder: "Todos" },
  ];

  return (
    <AdminSection title={resumen.title} subtitle={resumen.subtitle} description={resumen.description}>
      <FilterBar fields={filters} labels={{ apply: resumen.filters.aplicar, clear: resumen.filters.limpiar }} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {resumen.stats.map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} change={stat.change} trend={stat.trend as "up" | "down"} />
        ))}
      </div>
      <h2 className="mt-10 font-[family-name:var(--font-figtree)] text-lg font-semibold text-ink">Alertas operativas</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resumen.alerts.map((alert, i) => (
          <AlertCard key={i} type={alert.type as "warning" | "danger" | "info"} title={alert.title} description={alert.description} />
        ))}
      </div>
    </AdminSection>
  );
}
