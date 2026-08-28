"use client";

import { useState } from "react";
import { useToast } from "../../../components/admin/Toast";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function NotificacionesPageClient({ data }: { data: any }) {
  const [showCreate, setShowCreate] = useState(false);
  const [items, setItems] = useState(data.items);
  const [event, setEvent] = useState("");
  const [channel, setChannel] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const toast = useToast();

  const uniqueEvents: string[] = Array.from(new Set(items.map((i: any) => i.event)));

  const columns = [
    { key: "id", label: data.table.id },
    { key: "event", label: data.table.event },
    { key: "channel", label: data.table.channel },
    { key: "status", label: data.table.status },
    { key: "lastSent", label: data.table.lastSent },
    { key: "deliverability", label: data.table.deliverability },
  ];

  function handleCreate() {
    const newItem = {
      id: `NTF-${String(items.length + 1).padStart(3, "0")}`,
      event,
      channel,
      status: "draft",
      lastSent: "—",
      deliverability: "—",
    };
    setItems([...items, newItem]);
    toast.show(data.modal.created);
    setEvent("");
    setChannel("");
    setSubject("");
    setBody("");
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
          rows={items.map((i: any) => ({ ...i, status: <StatusBadge status={i.status} /> }))}
          actions={[
            { label: data.actions.edit, onClick: () => toast.show(data.feedback.editing) },
            { label: data.actions.toggle, onClick: () => toast.show(data.feedback.statusUpdated) },
            { label: data.actions.test, onClick: () => toast.show(data.feedback.testSent) },
          ]}
        />
      </AdminSection>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={data.modal.title} closeLabel={data.modal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.event}</label>
            <select value={event} onChange={(e) => setEvent(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.modal.eventPlaceholder}</option>
              {uniqueEvents.map((ev: string) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.channel}</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.modal.channelPlaceholder}</option>
              {Object.entries(data.channels).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.subject}</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={data.modal.subjectPh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.body}</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={data.modal.bodyPh} rows={4} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCreate} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.modal.create}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.modal.cancel}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
