"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ClientesPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const toast = useToast();

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "email", label: data.table.email },
    { key: "phone", label: data.table.phone },
    { key: "requests", label: data.table.requests },
    { key: "registered", label: data.table.registered },
    { key: "lastAccess", label: data.table.lastAccess },
  ];

  const detailFields = [
    { key: "name", label: data.detail.name },
    { key: "email", label: data.detail.email },
    { key: "requests", label: data.detail.requests },
    { key: "lastAccess", label: data.detail.lastAccess },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.block, onClick: () => toast.show("Cliente bloqueado") },
            { label: data.actions.export, onClick: () => toast.show("Exportando datos...") },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {detailFields.map((field) => (
                <div key={field.key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted">{field.label}</p>
                  <p className="text-sm font-semibold text-ink">{selectedRow[field.key]}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => toast.show("Cliente bloqueado")} className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.block}</button>
              <button type="button" onClick={() => toast.show("Exportando datos...")} className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.export}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
