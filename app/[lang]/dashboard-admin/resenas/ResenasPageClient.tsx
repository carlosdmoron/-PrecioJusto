"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ResenasPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    { key: "rating", label: data.table.rating },
    { key: "status", label: data.table.status },
    { key: "verified", label: data.table.verified },
    { key: "date", label: data.table.date },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.approve, onClick: () => {} },
            { label: data.actions.hide, onClick: () => {} },
            { label: data.actions.respond, onClick: (row) => setSelectedRow(row) },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title="Detalle de reseña" closeLabel="Cerrar">
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Cliente</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.client}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Profesional</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.professional}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Puntuación</p>
                <p className="text-sm font-semibold text-ink">{"⭐".repeat(Number(selectedRow.rating))}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Estado</p>
                <StatusBadge status={String(selectedRow.status)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">{data.actions.approve}</button>
              <button type="button" className="rounded-lg bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100">{data.actions.hide}</button>
              <button type="button" className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.remove}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
