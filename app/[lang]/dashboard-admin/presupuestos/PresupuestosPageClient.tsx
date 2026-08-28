"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function PresupuestosPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const toast = useToast();

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

  const detailFields = [
    { key: "title", label: data.detail.title },
    { key: "professional", label: data.detail.professional },
    { key: "client", label: data.detail.client },
    { key: "service", label: data.detail.service },
    { key: "amount", label: data.detail.amount },
    { key: "status", label: data.detail.status },
    { key: "leadCost", label: data.detail.leadCost },
    { key: "date", label: data.detail.date },
  ];

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.block, onClick: () => toast.show(data.feedback.blockedQuote) },
            { label: data.actions.notify, onClick: () => toast.show(data.feedback.notificationResent) },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
        {selectedRow && (
          <div className="mt-4 space-y-3">
            {detailFields.map((field) => (
              <div key={field.key} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-xs text-muted">{field.label}</span>
                {field.key === "status" ? (
                  <StatusBadge status={String(selectedRow[field.key])} />
                ) : (
                  <span className="text-xs font-medium text-ink">{String(selectedRow[field.key])}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
