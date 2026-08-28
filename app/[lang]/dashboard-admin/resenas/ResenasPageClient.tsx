"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import { sweetSuccess, sweetError } from "../../../components/admin/sweetAlert";
import type { TableRow } from "../../../components/admin/DataTable";
import { setReviewStatus } from "../../../actions/admin";

export default function ResenasPageClient({ data }: { data: any }) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const toast = useToast();
  const router = useRouter();
  const [items, setItems] = useState(data.items ?? []);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    { key: "rating", label: data.table.rating },
    { key: "status", label: data.table.status, render: (row: any) => <StatusBadge status={row.status} /> },
    { key: "verified", label: data.table.verified },
    { key: "date", label: data.table.date },
  ];

  const detailFields = [
    { key: "client", label: data.detail.client },
    { key: "professional", label: data.detail.professional },
    { key: "rating", label: data.detail.rating, isRating: true },
    { key: "status", label: data.detail.status, isStatus: true },
  ];

  async function handleStatus(row: TableRow, status: string, msg: string) {
    try {
      await setReviewStatus(String(row.id), status);
      setItems((prev: any[]) =>
        prev.map((i: any) => (i.id === row.id ? { ...i, status } : i))
      );
      await sweetSuccess(msg, data.feedback.verified);
      if (selectedRow?.id === row.id) setSelectedRow({ ...row, status });
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  return (
    <>
      <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
        <DataTable
          columns={columns}
          rows={items}
          actions={[
            { label: data.actions.approve, onClick: (row) => handleStatus(row, "published", data.feedback.reviewApproved) },
            { label: data.actions.hide, onClick: (row) => handleStatus(row, "hidden", data.feedback.reviewHidden) },
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
                onClick={() => { handleStatus(selectedRow, "published", data.feedback.reviewApproved); setSelectedRow(null); }}
                className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                {data.actions.approve}
              </button>
              <button
                type="button"
                onClick={() => { handleStatus(selectedRow, "hidden", data.feedback.reviewHidden); setSelectedRow(null); }}
                className="rounded-lg bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                {data.actions.hide}
              </button>
              <button
                type="button"
                onClick={() => { handleStatus(selectedRow, "removed", data.feedback.reviewRemoved); setSelectedRow(null); }}
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
