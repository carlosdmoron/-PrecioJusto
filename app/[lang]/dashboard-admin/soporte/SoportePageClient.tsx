"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function SoportePageClient({ data }: { data: any }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "from", label: data.table.from },
    { key: "type", label: data.table.type },
    { key: "priority", label: data.table.priority },
    { key: "sla", label: data.table.sla },
    { key: "status", label: data.table.status },
    { key: "assigned", label: data.table.assigned },
    { key: "date", label: data.table.date },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.create}</button>
        }
      >
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.assign, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.escalate, onClick: () => {} },
            { label: data.actions.resolve, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title="Detalle de ticket" closeLabel="Cerrar">
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(selectedRow).filter(([k]) => k !== "id").map(([key, val]) => (
                <div key={key} className="rounded-lg bg-surface p-3">
                  <p className="text-xs text-muted capitalize">{key}</p>
                  <p className="text-sm font-semibold text-ink">{String(val)}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Nota interna</label>
              <textarea rows={3} placeholder="Escribe una nota..." className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.actions.assign}</button>
              <button type="button" className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">{data.actions.escalate}</button>
              <button type="button" className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">{data.actions.resolve}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear ticket" closeLabel="Cancelar">
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Remitente</label>
            <input className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Tipo</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              {Object.entries(data.types).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Prioridad</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              {Object.entries(data.priorities).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Descripción</label>
            <textarea rows={3} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">Crear</button>
            <button type="button" onClick={() => setShowCreate(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">Cancelar</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
