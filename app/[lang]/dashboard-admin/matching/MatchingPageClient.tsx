"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function MatchingPageClient({ data }: { data: any }) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "criterion", label: data.table.criterion },
    { key: "priority", label: data.table.priority },
    { key: "professionals", label: data.table.professionals },
    { key: "status", label: data.table.status },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        actions={
          <>
            <button type="button" onClick={() => setShowSimulator(true)} className="h-10 rounded-lg border border-line/60 px-5 text-sm font-medium text-steel transition hover:text-ink">{data.simulate}</button>
            <button type="button" onClick={() => setShowCreate(true)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.create}</button>
          </>
        }
      >
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[{ label: data.actions.edit, onClick: () => {} }, { label: data.actions.toggle, onClick: () => {} }]}
        />
      </AdminSection>

      <Modal open={showSimulator} onClose={() => setShowSimulator(false)} title={data.simulator.title} closeLabel="Cerrar">
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.simulator.serviceLabel}</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">—</option>
              <option value="plomeria">Reparación de tuberías</option>
              <option value="pintura">Pintura de interiores</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.simulator.zoneLabel}</label>
            <input placeholder="28001" className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <button type="button" className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.simulator.run}</button>
          <div>
            <p className="text-xs font-semibold text-muted">{data.simulator.results}</p>
            <div className="mt-2 space-y-2">
              {data.simulator.sampleResults.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-surface p-3">
                  <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "Incluido" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{r.status}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <p className="text-xs text-muted">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={data.create} closeLabel="Cancelar">
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Nombre de la regla</label>
            <input placeholder="Ej: Plomería Madrid Centro" className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Criterio principal</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">—</option>
              {Object.entries(data.criterions).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
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
