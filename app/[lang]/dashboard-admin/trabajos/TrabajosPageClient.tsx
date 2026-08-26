"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function TrabajosPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "request", label: data.table.request },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    { key: "status", label: data.table.status },
    { key: "commission", label: data.table.commission },
    { key: "startDate", label: data.table.startDate },
    { key: "endDate", label: data.table.endDate },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.updateStatus, onClick: () => {} },
            { label: data.actions.launchReview, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title="Detalle de trabajo" closeLabel="Cerrar">
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedRow).filter(([k]) => k !== "id").map(([key, val]) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted capitalize">{key}</p>
                  <p className="text-sm font-semibold text-ink">{String(val)}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.updateStatus}</button>
              <button type="button" className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">{data.actions.launchReview}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
