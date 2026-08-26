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
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize);
  const visibleCols = columns.filter((c) => !c.hidden);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line/40 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line/30 bg-surface">
              {visibleCols.map((col) => (
                <th key={col.key} className="px-4 py-3 text-xs font-semibold text-muted">{col.label}</th>
              ))}
              {actions && actions.length > 0 && <th className="px-4 py-3 text-xs font-semibold text-muted">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-line/20 transition hover:bg-surface/50">
                {visibleCols.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-ink">{row[col.key]}</td>
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
                          className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary/20"
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
                <td colSpan={visibleCols.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-sm text-muted">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted">Página {page + 1} de {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-line/60 px-3 py-1.5 text-xs font-medium text-steel transition hover:text-ink disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-line/60 px-3 py-1.5 text-xs font-medium text-steel transition hover:text-ink disabled:opacity-40"
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
