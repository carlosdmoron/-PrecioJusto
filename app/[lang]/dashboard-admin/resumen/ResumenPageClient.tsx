"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const MainChart = dynamic(() => import("./MainChart"), { ssr: false });

type StatItem = {
  label: string;
  value: string;
  change: string;
  trend: string;
};

type AlertItem = { type: string; title: string; description: string };

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

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeries(seed: number, n: number, endValue: number) {
  const rnd = mulberry(seed);
  const start = endValue * (0.55 + rnd() * 0.2);
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const trend = start + (endValue - start) * t;
    const noise = (rnd() - 0.5) * endValue * 0.18;
    pts.push(Math.max(1, Math.round(trend + noise)));
  }
  pts[n - 1] = endValue;
  return pts;
}

function parseValue(v: string): number {
  const n = parseFloat(v.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 100;
}

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
const TAB_BASE: Record<string, number> = { solicitudes: 247, presupuestos: 583, trabajos: 327 };

function KpiCard({
  label,
  value,
  change,
  trend,
  vsPrev,
  invert = false,
  seed,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  vsPrev: string;
  invert?: boolean;
  seed: number;
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
        <Sparkline
          points={generateSeries(seed, 14, parseValue(value))}
          color={good ? "#16A34A" : "#DC2626"}
          width={110}
          height={32}
        />
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
  stats,
  alerts,
  filters,
  filterLabels,
  ui,
  solicitudesHref,
}: {
  userName: string | null;
  stats: StatItem[];
  alerts: AlertItem[];
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

  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(
      h < 12 ? ui.greetingMorning : h < 20 ? ui.greetingAfternoon : ui.greetingEvening
    );
  }, [ui]);

  const nPoints = RANGE_POINTS[range];
  const chartData = useMemo(() => {
    const labels = chartLabels(nPoints);
    const series = generateSeries(
      TAB_BASE[tab] + nPoints,
      nPoints,
      TAB_BASE[tab]
    );
    return labels.map((label, i) => ({ label, value: series[i] }));
  }, [tab, nPoints]);

  const total = chartData.reduce((a, p) => a + p.value, 0);
  const funnelMax = parseValue(ui.funnel.steps[0]?.value ?? "1");

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
                      if (k !== "today") setRange(k as "d7" | "d30" | "d90");
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
        {stats.slice(0, 4).map((s, i) => (
          <KpiCard
            key={s.label}
            label={s.label}
            value={s.value}
            change={s.change}
            trend={s.trend as "up" | "down"}
            vsPrev={ui.kpis.vsPrev}
            invert={/abandono|abandon|drop/i.test(s.label)}
            seed={i + 1}
            icon={
              [
                <ClipboardList key="i" size={17} strokeWidth={2} />,
                <CheckCircle2 key="i" size={17} strokeWidth={2} />,
                <UserX key="i" size={17} strokeWidth={2} />,
                <FileText key="i" size={17} strokeWidth={2} />,
              ][i]
            }
          />
        ))}
      </div>

      {/* ── KPIs fila 2 ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={ui.kpis.revenue} value={ui.kpis.revenueValue} change={ui.kpis.revenueChange} trend="up" vsPrev={ui.kpis.vsPrev} seed={5} icon={<Wallet size={17} strokeWidth={2} />} />
        <KpiCard label={ui.kpis.activePros} value={ui.kpis.activeProsValue} change={ui.kpis.activeProsChange} trend="up" vsPrev={ui.kpis.vsPrev} seed={6} icon={<Users size={17} strokeWidth={2} />} />
        <KpiCard label={ui.kpis.conversion} value={ui.kpis.conversionValue} change={ui.kpis.conversionChange} trend="up" vsPrev={ui.kpis.vsPrev} seed={7} icon={<Percent size={17} strokeWidth={2} />} />
        <KpiCard label={ui.kpis.avgResponse} value={ui.kpis.avgResponseValue} change={ui.kpis.avgResponseChange} trend="down" vsPrev={ui.kpis.vsPrev} invert seed={8} icon={<Timer size={17} strokeWidth={2} />} />
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
                    onClick={() => setTab(k as typeof tab)}
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
              {(() => {
                const ch =
                  tab === "solicitudes"
                    ? stats[0]?.change
                    : tab === "presupuestos"
                      ? stats[3]?.change
                      : undefined;
                return ch ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pj-success-bg px-2 py-0.5 text-xs font-semibold text-pj-success">
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                    {ch} {ui.kpis.vsPrev}
                  </span>
                ) : (
                  <span />
                );
              })()}
              <div className="flex justify-end gap-1">
              {(Object.keys(ui.chartRanges) as Array<keyof typeof ui.chartRanges>).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRange(k as typeof range)}
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
            {ui.funnel.steps.map((step, i) => {
              const pct = Math.round((parseValue(step.value) / funnelMax) * 100);
              const next = ui.funnel.steps[i + 1];
              const convPct = next
                ? Math.round((parseValue(next.value) / parseValue(step.value)) * 100)
                : null;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-pj-steel">{step.label}</span>
                    <span className="font-bold text-pj-ink">{step.value}</span>
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
            {ui.activity.items.map((a, i) => (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {i < ui.activity.items.length - 1 ? (
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
              {ui.topPros.items.map((p) => (
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
