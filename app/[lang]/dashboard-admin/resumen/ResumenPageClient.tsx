"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Info,
  OctagonAlert,
  Percent,
  SlidersHorizontal,
  Star,
  Timer,
  Users,
  UserX,
  Wallet,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  Badge,
  Sparkline,
  type BadgeVariant,
} from "../../../components/admin/ui";
import type { FilterField } from "../../../components/admin/FilterBar";
import { getChartData } from "../../../../app/actions/admin";
import type { DashboardResumen } from "../../../../app/actions/admin";

const MainChart = dynamic(() => import("./MainChart"), { ssr: false });

type ResumenUi = {
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingSubtitle: string;
  period: { label: string; today: string; d7: string; d30: string; d90: string; custom: string };
  chartRanges: { d7: string; d30: string; d90: string; y1: string };
  filtersButton: string;
  drawerTitle: string;
  kpis: Record<string, string>;
  chart: { title: string; units: Record<string, string>; tabs: Record<string, string> };
  funnel: { title: string; steps: { label: string; value: string }[] };
  attention: { title: string; viewAll: string; view: string };
  topPros: {
    title: string;
    colPro: string;
    colJobs: string;
    colRating: string;
    colConv: string;
    items: { name: string; specialty: string; jobs: string; rating: string; conversion: string }[];
  };
  activity: { title: string; items: { title: string; meta: string; time: string }[] };
};

function chartLabels(n: number): string[] {
  if (n >= 52) return Array.from({ length: n }, (_, i) => `S${i + 1}`);
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }
  return out;
}

const RANGE_POINTS: Record<string, number> = { d7: 7, d30: 30, d90: 90, y1: 52 };
const TAB_COLORS: Record<string, string> = {
  solicitudes: "#2563EB",
  presupuestos: "#0891B2",
  trabajos: "#16A34A",
};

function KpiCard({
  label,
  value,
  change,
  trend,
  vsPrev,
  invert = false,
  sparkData,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  vsPrev: string;
  invert?: boolean;
  sparkData?: number[];
  icon?: React.ReactNode;
}) {
  const isUp = trend === "up";
  const good = invert ? !isUp : isUp;
  return (
    <Card className="p-5 transition-shadow duration-150 hover:shadow-pj-pop">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-pj-bg text-pj-steel">
              {icon}
            </span>
          ) : null}
          <p className="text-sm font-medium text-pj-steel">{label}</p>
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            good ? "bg-pj-success-bg text-pj-success" : "bg-pj-danger-bg text-pj-danger"
          }`}
        >
          {isUp ? (
            <ArrowUpRight size={12} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={12} strokeWidth={2.5} />
          )}
          {change}
        </span>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-pj-ink">
        {value}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[11px] text-pj-faint">{vsPrev}</p>
        {sparkData && sparkData.length > 0 ? (
          <Sparkline
            points={sparkData}
            color={good ? "#16A34A" : "#DC2626"}
            width={110}
            height={32}
          />
        ) : null}
      </div>
    </Card>
  );
}

const ALERT_STYLE: Record<string, { icon: typeof Info; badge: BadgeVariant; bar: string }> = {
  danger: { icon: OctagonAlert, badge: "danger", bar: "bg-pj-danger" },
  warning: { icon: AlertTriangle, badge: "warning", bar: "bg-pj-warning" },
  info: { icon: Info, badge: "info", bar: "bg-pj-info" },
};

export default function ResumenPageClient({
  userName,
  dashboardData,
  filters,
  filterLabels,
  ui,
  solicitudesHref,
}: {
  userName: string | null;
  dashboardData: DashboardResumen | null;
  filters: FilterField[];
  filterLabels: { apply: string; clear: string };
  ui: ResumenUi;
  solicitudesHref: string;
}) {
  const [greeting, setGreeting] = useState("");
  const [range, setRange] = useState<"d7" | "d30" | "d90" | "y1">("d30");
  const [tab, setTab] = useState<"solicitudes" | "presupuestos" | "trabajos">("solicitudes");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(
      h < 12 ? ui.greetingMorning : h < 20 ? ui.greetingAfternoon : ui.greetingEvening
    );
  }, [ui]);

  useEffect(() => {
    const nPoints = RANGE_POINTS[range];
    const labels = chartLabels(nPoints);

    if (dashboardData?.chart) {
      const key = tab;
      const raw = dashboardData.chart[key] ?? [];
      const padded = [...raw];
      while (padded.length < nPoints) padded.unshift(0);
      const sliced = padded.slice(-nPoints);
      setChartData(labels.map((label, i) => ({ label, value: sliced[i] ?? 0 })));
    } else {
      startTransition(async () => {
        try {
          const raw = await getChartData(range, tab);
          const padded = [...raw];
          while (padded.length < nPoints) padded.unshift(0);
          const sliced = padded.slice(-nPoints);
          setChartData(labels.map((label, i) => ({ label, value: sliced[i] ?? 0 })));
        } catch {
          setChartData(labels.map((label) => ({ label, value: 0 })));
        }
      });
    }
  }, [range, tab, dashboardData]);

  const handleRangeChange = (newRange: typeof range) => {
    setRange(newRange);
    setPeriodOpen(false);
  };

  const handleTabChange = (newTab: typeof tab) => {
    setTab(newTab);
  };

  const total = chartData.reduce((a, p) => a + p.value, 0);
  const stats = dashboardData?.stats;
  const funnel = dashboardData?.funnel;
  const funnelSteps = funnel
    ? [
        { label: "Solicitudes", value: funnel.solicitudes },
        { label: "Presupuestos", value: funnel.presupuestos },
        { label: "Trabajos", value: funnel.trabajos },
        { label: "Completados", value: funnel.completados },
      ]
    : ui.funnel.steps.map((s) => ({ label: s.label, value: parseInt(s.value.replace(/\D/g, "")) || 0 }));
  const funnelMax = funnelSteps[0]?.value || 1;

  const alerts = dashboardData?.alertas ?? [];
  const activity = dashboardData?.actividad ?? [];
  const topPros = dashboardData?.topPros ?? [];

  const sparkSolicitudes = dashboardData?.chart?.solicitudes ?? [];
  const sparkPresupuestos = dashboardData?.chart?.presupuestos ?? [];
  const sparkTrabajos = dashboardData?.chart?.trabajos ?? [];

  const kpiRow1 = stats
    ? [
        {
          label: ui.chart.tabs.solicitudes,
          value: stats.solicitudes.total.toLocaleString("es-ES"),
          change: stats.solicitudes.change,
          trend: (stats.solicitudes.nuevas > 0 ? "up" : "down") as "up" | "down",
          icon: <ClipboardList size={17} strokeWidth={2} />,
          spark: sparkSolicitudes,
        },
        {
          label: ui.chart.tabs.trabajos,
          value: stats.completadas.total.toLocaleString("es-ES"),
          change: stats.completadas.change,
          trend: (stats.completadas.total > 0 ? "up" : "down") as "up" | "down",
          icon: <CheckCircle2 size={17} strokeWidth={2} />,
          spark: sparkTrabajos,
        },
        {
          label: ui.kpis.vsPrev.split(" ").pop() ?? "Abandono",
          value: `${stats.abandono.tasa}%`,
          change: stats.abandono.change,
          trend: "down" as const,
          icon: <UserX size={17} strokeWidth={2} />,
          invert: true,
          spark: [],
        },
        {
          label: ui.chart.tabs.presupuestos,
          value: stats.presupuestos.total.toLocaleString("es-ES"),
          change: stats.presupuestos.change,
          trend: (stats.presupuestos.total > 0 ? "up" : "down") as "up" | "down",
          icon: <FileText size={17} strokeWidth={2} />,
          spark: sparkPresupuestos,
        },
      ]
    : [];

  const kpiRow2 = stats
    ? [
        {
          label: ui.kpis.revenue,
          value: `€${stats.ingresos.total.toLocaleString("es-ES")}`,
          change: stats.ingresos.change,
          trend: "up" as const,
          icon: <Wallet size={17} strokeWidth={2} />,
        },
        {
          label: ui.kpis.activePros,
          value: stats.profesionalesActivos.total.toLocaleString("es-ES"),
          change: stats.profesionalesActivos.change,
          trend: "up" as const,
          icon: <Users size={17} strokeWidth={2} />,
        },
        {
          label: ui.kpis.conversion,
          value: `${stats.tasaConversion.tasa}%`,
          change: stats.tasaConversion.change,
          trend: "up" as const,
          icon: <Percent size={17} strokeWidth={2} />,
        },
        {
          label: ui.kpis.avgResponse,
          value: `${stats.tiempoRespuesta.minutos} min`,
          change: stats.tiempoRespuesta.change,
          trend: "down" as const,
          icon: <Timer size={17} strokeWidth={2} />,
          invert: true,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-pj-ink">
            {greeting || ui.greetingMorning}
            {userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-pj-steel">{ui.greetingSubtitle}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPeriodOpen((v) => !v)}
            aria-expanded={periodOpen}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-pj-border bg-white px-4 text-sm font-semibold text-pj-ink transition hover:bg-pj-bg"
          >
            <CalendarDays size={16} strokeWidth={2} className="text-pj-steel" />
            {ui.period[range === "y1" ? "d90" : range] ?? ui.period.d30}
            <ChevronDown size={14} className="text-pj-faint" />
          </button>
          {periodOpen ? (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPeriodOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-pj-border bg-white py-1.5 shadow-pj-pop">
                {(["today", "d7", "d30", "d90"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k !== "today") handleRangeChange(k as "d7" | "d30" | "d90");
                      setPeriodOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-pj-bg ${
                      range === k ? "font-semibold text-pj-primary" : "text-pj-steel"
                    }`}
                  >
                    {ui.period[k]}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Filtros compactos ── */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-pj-border bg-white px-3 text-xs font-medium text-pj-steel transition hover:border-pj-primary/40 hover:text-pj-ink"
          >
            {f.label}
            <ChevronDown size={12} className="text-pj-faint" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-pj-primary px-3 text-xs font-semibold text-white shadow-sm shadow-pj-primary/25 transition hover:bg-pj-primary-hover"
        >
          <SlidersHorizontal size={14} strokeWidth={2} />
          {ui.filtersButton}
        </button>
      </div>

      {/* ── KPIs fila 1 ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiRow1.map((s, i) => (
          <KpiCard
            key={i}
            label={s.label}
            value={s.value}
            change={s.change}
            trend={s.trend}
            vsPrev={ui.kpis.vsPrev}
            invert={s.invert}
            sparkData={s.spark}
            icon={s.icon}
          />
        ))}
      </div>

      {/* ── KPIs fila 2 ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiRow2.map((s, i) => (
          <KpiCard
            key={i}
            label={s.label}
            value={s.value}
            change={s.change}
            trend={s.trend}
            vsPrev={ui.kpis.vsPrev}
            invert={s.invert}
            icon={s.icon}
          />
        ))}
      </div>

      {/* ── Gráfico + Funnel ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={ui.chart.tabs[tab]}
            subtitle={`${total.toLocaleString("es-ES")} ${ui.chart.units[tab]}`}
            action={
              <div className="flex items-center gap-1 rounded-lg bg-pj-bg p-1">
                {(Object.keys(ui.chart.tabs) as Array<keyof typeof ui.chart.tabs>).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleTabChange(k as typeof tab)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      tab === k
                        ? "bg-white text-pj-primary shadow-sm"
                        : "text-pj-steel hover:text-pj-ink"
                    }`}
                  >
                    {ui.chart.tabs[k]}
                  </button>
                ))}
              </div>
            }
          />
          <div className="px-3 pb-4 pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              {isPending ? (
                <span className="text-xs text-pj-faint">Actualizando...</span>
              ) : (
                <span />
              )}
              <div className="flex justify-end gap-1">
              {(Object.keys(ui.chartRanges) as Array<keyof typeof ui.chartRanges>).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleRangeChange(k as typeof range)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    range === k
                      ? "bg-pj-active-bg text-pj-primary"
                      : "text-pj-faint hover:text-pj-ink"
                  }`}
                >
                  {ui.chartRanges[k]}
                </button>
              ))}
              </div>
            </div>
            <MainChart data={chartData} color={TAB_COLORS[tab]} />
          </div>
        </Card>

        <Card>
          <CardHeader title={ui.funnel.title} />
          <div className="flex flex-col gap-1 p-5">
            {funnelSteps.map((step, i) => {
              const pct = Math.round((step.value / funnelMax) * 100);
              const next = funnelSteps[i + 1];
              const convPct = next && step.value > 0
                ? Math.round((next.value / step.value) * 100)
                : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-pj-steel">{step.label}</span>
                    <span className="font-bold text-pj-ink">{step.value.toLocaleString("es-ES")}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-pj-neutral-bg">
                    <div
                      className="h-full rounded-full bg-pj-primary transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  {convPct !== null ? (
                    <p className="mt-1.5 mb-2 text-right text-[11px] font-medium text-pj-faint">
                      ↓ {convPct}%
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Atención + Actividad ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={ui.attention.title}
            action={
              <Link
                href={solicitudesHref}
                className="text-xs font-semibold text-pj-primary transition hover:text-pj-primary-hover"
              >
                {ui.attention.viewAll} →
              </Link>
            }
          />
          <ul>
            {alerts.map((a, i) => {
              const st = ALERT_STYLE[a.type] ?? ALERT_STYLE.info;
              const Icon = st.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 border-b border-pj-border/60 px-5 py-3.5 transition hover:bg-pj-bg last:border-0"
                >
                  <span className={`h-9 w-1 shrink-0 rounded-full ${st.bar}`} />
                  <Icon size={18} strokeWidth={2} className="shrink-0 text-pj-steel" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-pj-ink">{a.title}</p>
                    <p className="truncate text-xs text-pj-steel">{a.description}</p>
                  </div>
                  <Link
                    href={solicitudesHref}
                    className="shrink-0 text-xs font-semibold text-pj-primary transition hover:text-pj-primary-hover"
                  >
                    {ui.attention.view} →
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title={ui.activity.title} />
          <ul className="p-5">
            {activity.map((a, i) => (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {i < activity.length - 1 ? (
                  <span className="absolute left-[5px] top-4 h-full w-px bg-pj-border" aria-hidden="true" />
                ) : null}
                <span className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-pj-primary bg-white" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-pj-ink">{a.title}</p>
                  <p className="truncate text-xs text-pj-steel">{a.meta}</p>
                  <p className="mt-0.5 text-[11px] text-pj-faint">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ── Top profesionales ── */}
      <Card>
        <CardHeader title={ui.topPros.title} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-pj-border text-left text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                <th className="px-5 py-3">{ui.topPros.colPro}</th>
                <th className="px-5 py-3 text-right">{ui.topPros.colJobs}</th>
                <th className="px-5 py-3 text-right">{ui.topPros.colRating}</th>
                <th className="px-5 py-3 text-right">{ui.topPros.colConv}</th>
              </tr>
            </thead>
            <tbody>
              {topPros.length > 0
                ? topPros.map((p) => (
                    <tr key={p.name} className="border-b border-pj-border/60 transition hover:bg-pj-bg last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pj-active-bg text-xs font-bold text-pj-primary">
                            {p.name.split(" ").map((s) => s.charAt(0)).join("").toUpperCase().slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-pj-ink">{p.name}</p>
                            <p className="truncate text-xs text-pj-steel">{p.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-pj-ink">{p.jobs}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-pj-ink">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {p.rating > 0 ? p.rating.toFixed(1) : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant="success">{p.conversion}%</Badge>
                      </td>
                    </tr>
                  ))
                : (ui.topPros.items || []).map((p) => (
                    <tr key={p.name} className="border-b border-pj-border/60 transition hover:bg-pj-bg last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pj-active-bg text-xs font-bold text-pj-primary">
                            {p.name.split(" ").map((s) => s.charAt(0)).join("").toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-pj-ink">{p.name}</p>
                            <p className="truncate text-xs text-pj-steel">{p.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-pj-ink">{p.jobs}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-pj-ink">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {p.rating}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant="success">{p.conversion}</Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Drawer de filtros ── */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-pj-ink/45 backdrop-blur-[4px]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-pj-pop">
            <div className="flex items-center justify-between border-b border-pj-border px-5 py-4">
              <h2 className="text-base font-semibold text-pj-ink">{ui.drawerTitle}</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center rounded-lg text-pj-steel transition hover:bg-pj-bg"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
              {filters.map((f) => (
                <label key={f.key} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-pj-steel">{f.label}</span>
                  {f.type === "select" ? (
                    <select
                      defaultValue=""
                      className="h-10 rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none transition focus:border-pj-primary focus:ring-2 focus:ring-pj-primary/20"
                    >
                      <option value="">{f.placeholder ?? "—"}</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      placeholder={f.placeholder}
                      className="h-10 rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none transition focus:border-pj-primary focus:ring-2 focus:ring-pj-primary/20"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-3 border-t border-pj-border px-5 py-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-10 flex-1 rounded-lg border border-pj-border bg-white text-sm font-semibold text-slate-700 transition hover:bg-pj-bg"
              >
                {filterLabels.clear}
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-10 flex-1 rounded-lg bg-pj-primary text-sm font-semibold text-white shadow-sm shadow-pj-primary/25 transition hover:bg-pj-primary-hover"
              >
                {filterLabels.apply}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
