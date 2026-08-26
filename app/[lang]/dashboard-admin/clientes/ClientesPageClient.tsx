"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ClientesPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "email", label: data.table.email },
    { key: "phone", label: data.table.phone },
    { key: "requests", label: data.table.requests },
    { key: "registered", label: data.table.registered },
    { key: "lastAccess", label: data.table.lastAccess },
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
            { label: data.actions.export, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Nombre</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.name}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Email</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.email}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Solicitudes</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.requests}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Último acceso</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.lastAccess}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.block}</button>
              <button type="button" className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.export}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
