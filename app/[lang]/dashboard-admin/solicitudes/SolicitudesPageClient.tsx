"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import FilterBar from "../../../components/admin/FilterBar";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import { sweetSuccess, sweetError } from "../../../components/admin/sweetAlert";
import type { TableRow } from "../../../components/admin/DataTable";
import type { FilterField } from "../../../components/admin/FilterBar";
import { setRequestStatus } from "../../../actions/admin";

export default function SolicitudesPageClient({ data }: { data: any }) {
  const toast = useToast();
  const router = useRouter();
  const [items, setItems] = useState(data.items ?? []);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  useEffect(() => {
    setItems((prev: any[]) => {
      const next = data.items ?? [];
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [data.items]);

  const filterFields: FilterField[] = data.filters.fields;
  const [filtered, setFiltered] = useState<Record<string, string> | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  function applyFilters(values: Record<string, string>) {
    setFiltered(values);
    setFilterKey((k) => k + 1);
  }

  const visibleItems = filtered
    ? items.filter((item: any) =>
        filterFields.every((field) => {
          const v = (filtered[field.key] ?? "").trim().toLowerCase();
          if (!v) return true;
          let cell = String(item[field.key] ?? "").toLowerCase();
          if (field.key === "client") {
            cell = `${cell} ${(item.clientEmail ?? "").toLowerCase()}`;
          }
          if (field.type === "select") return cell === v;
          return cell.includes(v);
        })
      )
    : items;

  const columns = [
    { key: "code", label: data.table.id },
    { key: "service", label: data.table.service },
    { key: "client", label: data.table.client },
    { key: "city", label: data.table.city },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    { key: "urgency", label: data.table.urgency },
    { key: "quotes", label: data.table.quotes },
    { key: "date", label: data.table.date },
  ];

  async function handleStatus(row: TableRow, status: string, msg: string) {
    try {
      await setRequestStatus(String(row.id), status);
      setItems((prev: any[]) =>
        prev.map((i: any) => (i.id === row.id ? { ...i, status } : i))
      );
      await sweetSuccess(msg, data.feedback.verified);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
      >
        <div className="mb-6">
          <FilterBar
            fields={filterFields}
            labels={data.filters.labels}
            onApply={applyFilters}
          />
        </div>
        <DataTable
          key={filterKey}
          columns={columns}
          rows={visibleItems}
          actions={[
            {
              label: data.actions.edit,
              onClick: () => {
                toast.show(data.feedback.editingRequest);
              },
            },
            {
              label: data.actions.pause,
              onClick: (row) =>
                handleStatus(row, "cancelled", data.feedback.requestPaused),
            },
            {
              label: data.actions.detail,
              onClick: (row) => setSelectedRow(row),
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
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.detail.service}</p>
                <p className="text-sm font-semibold text-ink">
                  {selectedRow.service}
                </p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.detail.client}</p>
                <p className="text-sm font-semibold text-ink">
                  {selectedRow.client}
                </p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.detail.city}</p>
                <p className="text-sm font-semibold text-ink">
                  {selectedRow.city}
                </p>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <p className="text-xs text-muted">{data.table.status}</p>
                <StatusBadge status={selectedRow.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">
                {data.detail.answers}
              </p>
              <div className="mt-2 space-y-2">
                {data.detail.sampleAnswers.map((a: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between rounded-lg bg-surface px-3 py-2"
                  >
                    <span className="text-xs text-muted">{a.question}</span>
                    <span className="text-xs font-medium text-ink">
                      {a.answer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.show(data.feedback.editingRequest);
                }}
                className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
              >
                {data.actions.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStatus(selectedRow, "cancelled", data.feedback.requestPaused);
                  setSelectedRow(null);
                }}
                className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                {data.actions.pause}
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.show("Notificación reenviada");
                }}
                className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                {data.actions.resend}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStatus(selectedRow, "blocked", data.feedback.requestBlocked);
                  setSelectedRow(null);
                }}
                className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                {data.actions.block}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
