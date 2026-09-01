"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import { sweetSuccess, sweetError, sweetConfirmDelete } from "../../../components/admin/sweetAlert";
import { setClientBlocked, setClientActive } from "../../../actions/admin";
import type { TableColumn, TableRow } from "../../../components/admin/DataTable";

export default function ClientesPageClient({ data }: { data: any }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<TableRow[]>(data.items ?? []);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    setItems((prev: TableRow[]) => {
      const next = data.items ?? [];
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [data.items]);

  const columns: TableColumn[] = [
    { key: "id", label: data.table.id, hidden: true },
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

  function updateLocalStatus(id: string, status: string) {
    setItems((prev: TableRow[]) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  }

  async function handleBlock(row: TableRow) {
    const confirmed = await sweetConfirmDelete(
      data.feedback.confirmDeleteTitle,
      data.feedback.confirmDeleteText,
      data.feedback.confirmYes,
      data.feedback.confirmCancel
    );
    if (!confirmed) return;
    try {
      await setClientBlocked(String(row.id));
      updateLocalStatus(String(row.id), "banned");
      await sweetSuccess(data.feedback.blockedUser, data.feedback.verified);
      setSelectedRow(null);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  async function handleReactivate(row: TableRow) {
    try {
      await setClientActive(String(row.id));
      updateLocalStatus(String(row.id), "active");
      await sweetSuccess(data.feedback.clientReactivated, data.feedback.verified);
      setSelectedRow(null);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  function download(type: "csv" | "xls") {
    setExportOpen(false);
    const header = [
      data.table.id,
      data.table.name,
      data.table.email,
      data.table.phone,
      data.table.requests,
      data.table.registered,
      data.table.lastAccess,
    ];
    const body =
      type === "csv"
        ? items
            .map((r: TableRow) =>
              [
                r.id,
                r.name,
                r.email,
                r.phone,
                r.requests,
                r.registered,
                r.lastAccess,
              ]
                .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\n")
        : `<tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>` +
          items
            .map(
              (r: TableRow) =>
                `<tr>${[r.id, r.name, r.email, r.phone, r.requests, r.registered, r.lastAccess]
                  .map((v) => `<td>${String(v ?? "")}</td>`)
                  .join("")}</tr>`
            )
            .join("");

    const mime = type === "csv" ? "text/csv;charset=utf-8" : "application/vnd.ms-excel";
    const content =
      type === "csv"
        ? `${header.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(",")}\n${body}`
        : `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${body}</table></body></html>`;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              {data.export.label}
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-12 z-10 w-44 overflow-hidden rounded-xl border border-line/40 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => download("csv")}
                  className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                >
                  {data.export.csv}
                </button>
                <button
                  type="button"
                  onClick={() => download("xls")}
                  className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
                >
                  {data.export.xls}
                </button>
              </div>
            )}
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={items}
          actions={[
            { label: data.actions.view, onClick: (row) => setSelectedRow(row) },
            {
              label: data.actions.block,
              show: (row) => row.status !== "banned",
              onClick: (row) => handleBlock(row),
            },
            {
              label: data.actions.reactivate,
              show: (row) => row.status === "banned",
              onClick: (row) => handleReactivate(row),
            },
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
            {selectedRow.status === "banned" ? (
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleReactivate(selectedRow)}
                  className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  {data.actions.reactivate}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleBlock(selectedRow)}
                  className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  {data.actions.block}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}