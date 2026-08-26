"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";

export default function MarketingPageClient({ data }: { data: any }) {
  const [tab, setTab] = useState<"pages" | "promotions" | "seo">("pages");

  function toColumns(obj: Record<string, string>) {
    return Object.entries(obj).map(([key, label]) => ({ key, label }));
  }

  return (
    <AdminSection title={data.title} subtitle={data.subtitle}>
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        {(["pages", "promotions", "seo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {data.tabs[t]}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "pages" && (
          <DataTable
            columns={toColumns(data.pages.table)}
            rows={data.pages.items.map((i: any) => ({ ...i }))}
            actions={[{ label: "Editar", onClick: () => {} }]}
          />
        )}
        {tab === "promotions" && (
          <DataTable
            columns={toColumns(data.promotions.table)}
            rows={data.promotions.items.map((i: any) => ({ ...i }))}
            actions={[{ label: "Editar", onClick: () => {} }]}
          />
        )}
        {tab === "seo" && (
          <DataTable
            columns={toColumns(data.seo.table)}
            rows={data.seo.items.map((i: any, idx: number) => ({ id: String(idx), ...i }))}
            actions={[{ label: "Editar", onClick: () => {} }]}
          />
        )}
      </div>
    </AdminSection>
  );
}
