"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ConversacionesPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "request", label: data.table.request },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    { key: "channel", label: data.table.channel },
    { key: "status", label: data.table.status },
    { key: "lastMessage", label: data.table.lastMessage },
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
            { label: data.actions.flag, onClick: () => {} },
            { label: data.actions.note, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title="Detalle de conversación" closeLabel="Cerrar">
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
                <p className="text-xs text-muted">Canal</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.channel}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">Estado</p>
                <StatusBadge status={String(selectedRow.status)} />
              </div>
            </div>
            <div className="rounded-lg border border-line/30 bg-surface p-3">
              <p className="text-xs font-semibold text-muted">Último mensaje</p>
              <p className="mt-1 text-sm text-ink">{selectedRow.lastMessage}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100">{data.actions.flag}</button>
              <button type="button" className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.hide}</button>
              <button type="button" className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.note}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
