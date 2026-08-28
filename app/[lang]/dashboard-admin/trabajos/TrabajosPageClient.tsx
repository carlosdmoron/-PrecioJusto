"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function TrabajosPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const toast = useToast();

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

  const detailFields = [
    { key: "request", label: data.detail.request },
    { key: "client", label: data.detail.client },
    { key: "professional", label: data.detail.professional },
    { key: "status", label: data.detail.status, isStatus: true },
    { key: "commission", label: data.detail.commission },
    { key: "startDate", label: data.detail.startDate },
    { key: "endDate", label: data.detail.endDate },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.updateStatus, onClick: () => toast.show(data.feedback.statusUpdated) },
            { label: data.actions.launchReview, onClick: () => toast.show(data.feedback.reviewRequestSent) },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {detailFields.map(({ key, label, isStatus }) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted">{label}</p>
                  {isStatus ? (
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
                onClick={() => { toast.show(data.feedback.statusUpdated); setSelectedRow(null); }}
                className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
              >
                {data.actions.updateStatus}
              </button>
              <button
                type="button"
                onClick={() => { toast.show(data.feedback.reviewRequestSent); setSelectedRow(null); }}
                className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                {data.actions.launchReview}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
