"use client";

import { useState } from "react";
import Modal from "../dashboard/Modal";

export type TableColumn = {
  key: string;
  label: string;
  hidden?: boolean;
};

export type TableRow = Record<string, string> & { id: string };

export default function DataTable({
  columns,
  rows,
  actions,
  modalTitle,
  modalContent,
  pageSize = 8,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  actions?: { label: string; onClick: (row: TableRow) => void }[];
  modalTitle?: string;
  modalContent?: (row: TableRow) => React.ReactNode;
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const totalPages = Math.ceil(rows.length / pageSize);
  const safePage = Math.min(page, Math.max(totalPages - 1, 0));
  const visible = rows.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const visibleCols = columns.filter((c) => !c.hidden);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-pj-border bg-white shadow-pj-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-pj-border bg-pj-bg">
              {visibleCols.map((col) => (
                <th key={col.key} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">{col.label}</th>
              ))}
              {actions && actions.length > 0 && <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-pj-border/60 transition hover:bg-pj-bg last:border-0">
                {visibleCols.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-pj-ink">{row[col.key]}</td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => {
                            if (modalContent) {
                              setSelectedRow(row);
                            } else {
                              action.onClick(row);
                            }
                          }}
                          className="rounded-lg bg-pj-active-bg px-3 py-1.5 text-xs font-semibold text-pj-primary transition hover:bg-blue-100"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-pj-faint">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-pj-steel">Página {safePage + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="rounded-lg border border-pj-border bg-white px-3 py-1.5 text-xs font-medium text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(p + 1, Math.max(totalPages - 1, 0)))}
              className="rounded-lg border border-pj-border bg-white px-3 py-1.5 text-xs font-medium text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      {modalContent && selectedRow && modalTitle && (
        <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={modalTitle} closeLabel="Cerrar">
          {modalContent(selectedRow)}
        </Modal>
      )}
    </>
  );
}
