"use client";

import { useState } from "react";
import { useToast } from "../../../components/admin/Toast";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function SoportePageClient({ data }: { data: any }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [items, setItems] = useState(data.items);
  const [sender, setSender] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const toast = useToast();

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

  function handleCreate() {
    const newItem = {
      id: `TKT-${String(items.length + 101).padStart(4, "0")}`,
      from: sender,
      type,
      priority,
      sla: "8h",
      status: "open",
      assigned: "—",
      date: new Date().toLocaleDateString("es-ES"),
    };
    setItems([...items, newItem]);
    toast.show(data.createModal.created);
    setSender("");
    setType("");
    setPriority("");
    setDescription("");
    setShowCreate(false);
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.create}</button>
        }
      >
        <DataTable
          columns={columns}
          rows={items.map((i: any) => ({ ...i, status: <StatusBadge status={i.status} />, priority: <StatusBadge status={i.priority} /> }))}
          actions={[
            { label: data.actions.assign, onClick: (row) => setSelectedRow(row) },
            { label: data.actions.escalate, onClick: () => toast.show("Ticket escalado") },
            { label: data.actions.resolve, onClick: () => toast.show("Ticket resuelto") },
          ]}
        />
      </AdminSection>

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={data.detail.title} closeLabel={data.detail.close}>
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
              <label className="text-xs font-medium text-muted">{data.detail.note}</label>
              <textarea rows={3} placeholder={data.detail.notePh} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" onClick={() => { toast.show("Ticket asignado"); setSelectedRow(null); }} className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-dark transition hover:bg-primary/20">{data.detail.assign}</button>
              <button type="button" onClick={() => { toast.show("Ticket escalado"); setSelectedRow(null); }} className="rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">{data.detail.escalate}</button>
              <button type="button" onClick={() => { toast.show("Ticket resuelto"); setSelectedRow(null); }} className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">{data.detail.resolve}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={data.createModal.title} closeLabel={data.createModal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.sender}</label>
            <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder={data.createModal.senderPh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.type}</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.createModal.typePlaceholder}</option>
              {Object.entries(data.types).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.priority}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.createModal.priorityPlaceholder}</option>
              {Object.entries(data.priorities).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.description}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={data.createModal.descriptionPh} rows={3} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCreate} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.createModal.create}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.createModal.cancel}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
