"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ServiciosPageClient({ data }: { data: any }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TableRow | null>(null);
  const [items, setItems] = useState(data.items);
  const [form, setForm] = useState({ name: "", category: "", description: "", status: "draft", slug: "" });

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "category", label: data.table.category },
    { key: "status", label: data.table.status, render: (v: string) => <StatusBadge status={v} /> },
    { key: "requests", label: data.table.requests },
    { key: "revenue", label: data.table.revenue },
  ];

  function openCreate() {
    setEditingItem(null);
    setForm({ name: "", category: "", description: "", status: "draft", slug: "" });
    setShowModal(true);
  }

  function openEdit(row: TableRow) {
    setEditingItem(row);
    setForm({ name: String(row.name ?? ""), category: "", description: "", status: String(row.status ?? "draft"), slug: "" });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingItem) {
      setItems((prev: any[]) => prev.map((it: any) => it.id === editingItem.id ? { ...it, name: form.name, category: form.category || it.category, status: form.status } : it));
      toast.show("Servicio actualizado");
    } else {
      const newItem = { id: `SRV-${String(items.length + 1).padStart(3, "0")}`, name: form.name, category: form.category, status: form.status, requests: "0", revenue: "€0" };
      setItems((prev: any[]) => [newItem, ...prev]);
      toast.show("Servicio creado");
    }
    setShowModal(false);
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <button type="button" onClick={openCreate} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">
            {data.create}
          </button>
        }
      >
        <DataTable
          columns={columns}
          rows={items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions.edit, onClick: (row) => openEdit(row) },
            { label: data.actions.preview, onClick: () => toast.show("Vista previa abierta", "info") },
          ]}
        />
      </AdminSection>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingItem ? data.modal.editTitle : data.modal.createTitle} closeLabel={data.modal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.name}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={data.modal.namePh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.category}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.modal.categoryPlaceholder}</option>
              {data.categories.map((cat: any) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.description}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={data.modal.descriptionPh} rows={3} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.status}</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              {Object.entries(data.statuses).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSave} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.modal.save}</button>
            <button type="button" onClick={() => setShowModal(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.modal.cancel}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
