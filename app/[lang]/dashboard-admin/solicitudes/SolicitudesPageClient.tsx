"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function SolicitudesPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "client", label: data.table.client },
    { key: "service", label: data.table.service },
    { key: "city", label: data.table.city },
    { key: "status", label: data.table.status },
    { key: "urgency", label: data.table.urgency },
    { key: "quotes", label: data.table.quotes },
    { key: "date", label: data.table.date },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.detail, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.edit, onClick: () => {} },
            { label: data.actions.pause, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">ID</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.id}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.table.client}</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.client}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.table.service}</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.service}</p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.table.city}</p>
                <p className="text-sm font-semibold text-ink">{selectedRow.city}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">{data.detail.answers}</p>
              <div className="mt-2 space-y-2">
                {data.detail.sampleAnswers.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                    <span className="text-xs text-muted">{a.question}</span>
                    <span className="text-xs font-medium text-ink">{a.answer}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.edit}</button>
              <button type="button" className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">{data.actions.pause}</button>
              <button type="button" className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">{data.actions.resend}</button>
              <button type="button" className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100">{data.actions.block}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
