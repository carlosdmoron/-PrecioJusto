"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import type { TableRow } from "../../../components/admin/DataTable";

export default function ServiciosPageClient({ data }: { data: any }) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TableRow | null>(null);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "category", label: data.table.category },
    { key: "status", label: data.table.status },
    { key: "requests", label: data.table.requests },
    { key: "revenue", label: data.table.revenue },
  ];

  const rows = data.items.map((item: any) => ({ ...item, status: item.status }));

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        actions={
          <button
            type="button"
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {data.create}
          </button>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          actions={[
            { label: data.actions.edit, onClick: (row) => { setEditingItem(row); setShowModal(true); } },
            { label: data.actions.preview, onClick: () => {} },
          ]}
        />
      </AdminSection>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingItem ? data.modal.editTitle : data.modal.createTitle} closeLabel={data.modal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.name}</label>
            <input defaultValue={editingItem?.name ?? ""} placeholder={data.modal.namePh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.category}</label>
            <select defaultValue="" className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">—</option>
              <option value="plomeria">Plomería</option>
              <option value="pintura">Pintura</option>
              <option value="jardineria">Jardinería</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.description}</label>
            <textarea defaultValue={editingItem?.description ?? ""} placeholder={data.modal.descriptionPh} rows={3} className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.status}</label>
            <select defaultValue={editingItem?.status ?? "draft"} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="draft">Borrador</option>
              <option value="review">Revisión</option>
              <option value="published">Publicado</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.modal.save}</button>
            <button type="button" onClick={() => setShowModal(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.modal.cancel}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
