"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ResenasPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const toast = useToast();

  const columns = [
    { key: "id", label: data.table.id },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    { key: "rating", label: data.table.rating },
    { key: "status", label: data.table.status },
    { key: "verified", label: data.table.verified },
    { key: "date", label: data.table.date },
  ];

  const detailFields = [
    { key: "client", label: data.detail.client },
    { key: "professional", label: data.detail.professional },
    { key: "rating", label: data.detail.rating, isRating: true },
    { key: "status", label: data.detail.status, isStatus: true },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.approve, onClick: () => toast.show("Reseña aprobada") },
            { label: data.actions.hide, onClick: () => toast.show("Reseña ocultada") },
            { label: data.actions.respond, onClick: (row) => setSelectedRow(row) },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {detailFields.map(({ key, label, isRating, isStatus }) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted">{label}</p>
                  {isRating ? (
                    <p className="text-sm font-semibold text-ink">
                      {Array.from({ length: 5 }, (_, i) => (i < Number(selectedRow[key]) ? "★" : "☆")).join("")}
                    </p>
                  ) : isStatus ? (
                    <StatusBadge status={String(selectedRow[key])} />
                  ) : (
                    <p className="text-sm font-semibold text-ink">{String(selectedRow[key])}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => { toast.show("Reseña aprobada"); setSelectedRow(null); }}
                className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                {data.actions.approve}
              </button>
              <button
                type="button"
                onClick={() => { toast.show("Reseña ocultada"); setSelectedRow(null); }}
                className="rounded-lg bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                {data.actions.hide}
              </button>
              <button
                type="button"
                onClick={() => { toast.show("Reseña eliminada"); setSelectedRow(null); }}
                className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                {data.actions.remove}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
