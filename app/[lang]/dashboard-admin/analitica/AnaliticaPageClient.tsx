"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";

export default function AnaliticaPageClient({ data }: { data: any }) {
  const [tab, setTab] = useState<"funnels" | "reports">("funnels");

  return (
    <AdminSection
      title={data.title}
      subtitle={data.subtitle}
      actions={
        <button type="button" className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.export}</button>
      }
    >
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("funnels")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === "funnels" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          Embudos
        </button>
        <button
          type="button"
          onClick={() => setTab("reports")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === "reports" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          Reportes
        </button>
      </div>

      {tab === "funnels" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[data.funnelClient, data.funnelProfessional].map((funnel: any) => (
            <div key={funnel.title} className="rounded-xl border border-line/40 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">{funnel.title}</h3>
              <div className="mt-3 space-y-2">
                {funnel.steps.map((step: any, i: number) => {
                  const pct = parseInt(step.percent);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs text-muted">{step.step}</span>
                      <div className="relative h-5 flex-1 overflow-hidden rounded bg-surface">
                        <div className="absolute inset-y-0 left-0 rounded bg-primary/20" style={{ width: `${pct}%` }} />
                        <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium text-ink">{step.value} ({step.percent})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.reports.map((report: any, i: number) => (
            <div key={i} className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <p className="text-sm font-semibold text-ink">{report.name}</p>
              <p className="mt-1 text-xs text-muted">{report.description}</p>
              <button type="button" className="mt-3 text-xs font-semibold text-primary-dark transition hover:underline">Ver reporte →</button>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
