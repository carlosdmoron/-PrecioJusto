"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ProfesionalesPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "services", label: data.table.services },
    { key: "zone", label: data.table.zone },
    { key: "status", label: data.table.status },
    { key: "verified", label: data.table.verified },
    { key: "rating", label: data.table.rating },
    { key: "quotes", label: data.table.quotes },
  ];

  const pending = data.items.filter((i: any) => i.status === "pending");

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        actions={
          pending.length > 0 ? (
            <span className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">{data.pendingCount}</span>
          ) : undefined
        }
      >
        {pending.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink">{data.approvalQueue}</h3>
            <div className="mt-3 space-y-2">
              {pending.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-line/40 bg-white p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-muted">{p.services} — {p.zone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">{data.actions.approve}</button>
                    <button type="button" className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.reject}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.edit, onClick: () => {} },
            { label: data.actions.suspend, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-3">
            {[
              [data.detail.name, selectedRow.name],
              [data.detail.services, selectedRow.services],
              [data.detail.zone, selectedRow.zone],
              [data.detail.balance, "€1.245"],
              [data.detail.conversion, "12%"],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-xs text-muted">{String(label)}</span>
                <span className="text-xs font-medium text-ink">{String(value)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
