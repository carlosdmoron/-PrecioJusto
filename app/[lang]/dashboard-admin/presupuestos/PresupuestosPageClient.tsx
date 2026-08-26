"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function PresupuestosPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "professional", label: data.table.professional },
    { key: "client", label: data.table.client },
    { key: "service", label: data.table.service },
    { key: "amount", label: data.table.amount },
    { key: "status", label: data.table.status },
    { key: "leadCost", label: data.table.leadCost },
    { key: "date", label: data.table.date },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.block, onClick: () => {} },
            { label: data.actions.notify, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title="Detalle de presupuesto" closeLabel="Cerrar">
        {selectedRow && (
          <div className="mt-4 space-y-3">
            {Object.entries(selectedRow).filter(([k]) => k !== "id").map(([key, val]) => (
              <div key={key} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-xs text-muted capitalize">{key}</span>
                <span className="text-xs font-medium text-ink">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
