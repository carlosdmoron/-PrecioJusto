"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function NotificacionesPageClient({ data }: { data: any }) {
  const [showCreate, setShowCreate] = useState(false);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "event", label: data.table.event },
    { key: "channel", label: data.table.channel },
    { key: "status", label: data.table.status },
    { key: "lastSent", label: data.table.lastSent },
    { key: "deliverability", label: data.table.deliverability },
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
            { label: data.actions.edit, onClick: () => {} },
            { label: data.actions.toggle, onClick: () => {} },
            { label: data.actions.test, onClick: () => {} },
          ]}
        />
      </AdminSection>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear plantilla" closeLabel="Cancelar">
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Evento</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">—</option>
              {data.items.map((i: any) => <option key={i.id} value={i.id}>{i.event}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Canal</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              {Object.entries(data.channels).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Asunto / Cabecera</label>
            <input className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Cuerpo del mensaje</label>
            <textarea rows={4} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
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
