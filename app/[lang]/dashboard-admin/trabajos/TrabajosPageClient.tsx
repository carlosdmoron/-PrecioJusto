"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import { StatusBadge } from "../../../components/admin/ui";
import Modal from "../../../components/dashboard/Modal";
import { sweetSuccess, sweetError } from "../../../components/admin/sweetAlert";
import { setJobStatus } from "../../../actions/admin";
import type { TableColumn, TableRow } from "../../../components/admin/DataTable";

const STATUS_FLOW: Record<string, string[]> = {
  selected: ["started", "cancelled", "disputed"],
  started: ["inProgress", "cancelled", "disputed"],
  inProgress: ["completed", "cancelled", "disputed"],
  completed: [],
  cancelled: [],
  disputed: [],
};

export default function TrabajosPageClient({ data }: { data: any }) {
  const router = useRouter();
  const [items, setItems] = useState<TableRow[]>(data.items ?? []);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [statusRow, setStatusRow] = useState<TableRow | null>(null);

  useEffect(() => {
    setItems((prev: TableRow[]) => {
      const next = data.items ?? [];
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [data.items]);

  const statuses: Record<string, string> = data.statuses ?? {};

  const columns: TableColumn[] = [
    { key: "id", label: data.table.id, hidden: true },
    { key: "request", label: data.table.request },
    { key: "client", label: data.table.client },
    { key: "professional", label: data.table.professional },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => (
        <StatusBadge
          status={String(row.status)}
          label={statuses[String(row.status)] ?? String(row.status)}
        />
      ),
    },
    { key: "commission", label: data.table.commission },
    { key: "startDate", label: data.table.startDate },
    { key: "endDate", label: data.table.endDate },
  ];

  async function handleSetStatus(id: string, status: string, nextLabel: string) {
    try {
      await setJobStatus(id, status);
      setItems((prev: TableRow[]) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
      await sweetSuccess(
        `${data.feedback.jobStatusUpdated} — ${nextLabel}`,
        data.feedback.verified
      );
      setStatusRow(null);
      if (selectedRow?.id === id) setSelectedRow({ ...selectedRow, status });
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  const statusDetailFields = [
    { key: "request", label: data.detail.request },
    { key: "client", label: data.detail.client },
    { key: "professional", label: data.detail.professional },
    { key: "commission", label: data.detail.commission },
    { key: "startDate", label: data.detail.startDate },
    { key: "endDate", label: data.detail.endDate },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
      >
        <DataTable
          columns={columns}
          rows={items}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            {
              label: data.actions.updateStatus,
              show: (row) => (STATUS_FLOW[String(row.status)] ?? []).length > 0,
              onClick: (row) => setStatusRow(row),
            },
          ]}
        />
      </AdminSection>

      <Modal
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        title={data.detail.title}
        closeLabel={data.detail.close}
      >
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {statusDetailFields.map((field) => (
                <div key={field.key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted">{field.label}</p>
                  <p className="text-sm font-semibold text-ink">
                    {String(selectedRow[field.key] ?? "—")}
                  </p>
                </div>
              ))}
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.detail.status}</p>
                <StatusBadge
                  status={String(selectedRow.status)}
                  label={statuses[String(selectedRow.status)] ?? String(selectedRow.status)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRow(null);
                  setStatusRow(selectedRow);
                }}
                className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
              >
                {data.actions.updateStatus}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!statusRow}
        onClose={() => setStatusRow(null)}
        title={data.actions.updateStatus}
        closeLabel={data.detail.close}
      >
        {statusRow && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted">
              {statusRow.request} — {statusRow.client}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(STATUS_FLOW[String(statusRow.status)] ?? []).map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => handleSetStatus(String(statusRow.id), next, statuses[next] ?? next)}
                  className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
                >
                  {statuses[next] ?? next}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
