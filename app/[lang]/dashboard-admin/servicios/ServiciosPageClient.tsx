"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";
import {
  createService,
  updateService,
  deleteService,
} from "../../../actions/admin";

type Cat = { id: string; name: string; slug: string };

export default function ServiciosPageClient({ data }: { data: any }) {
  const toast = useToast();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TableRow | null>(null);
  const [items, setItems] = useState(data.items ?? []);
  const categories: Cat[] = data.categories ?? [];
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    status: "draft",
    slug: "",
  });
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: "name", label: data.table.name },
    { key: "category", label: data.table.category, render: (v: string) => v ?? "—" },
    {
      key: "status",
      label: data.table.status,
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: "requests_count", label: data.table.requests },
    {
      key: "revenue",
      label: data.table.revenue,
      render: (v: number) => `€${Number(v ?? 0).toLocaleString()}`,
    },
  ];

  function openCreate() {
    setEditingItem(null);
    setForm({ name: "", category_id: "", description: "", status: "draft", slug: "" });
    setShowModal(true);
  }

  function openEdit(row: TableRow) {
    setEditingItem(row);
    const selected = categories.find((c) => c.name === row.category);
    setForm({
      name: String(row.name ?? ""),
      category_id: selected?.id ?? "",
      description: String(row.description ?? ""),
      status: String(row.status ?? "draft"),
      slug: String(row.slug ?? ""),
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: form.description,
        status: form.status,
        category_id: form.category_id || null,
      };
      if (editingItem) {
        await updateService(String(editingItem.id), payload);
        toast.show(data.modal.updated ?? "Servicio actualizado");
      } else {
        await createService(payload);
        toast.show(data.modal.created ?? "Servicio creado");
      }
      router.refresh();
      setShowModal(false);
    } catch (e: any) {
      toast.show(e?.message ?? "Error", "info");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: TableRow) {
    try {
      await deleteService(String(row.id));
      setItems((prev: any[]) => prev.filter((it: any) => it.id !== row.id));
      toast.show(data.modal.deleted ?? "Servicio eliminado", "info");
      router.refresh();
    } catch (e: any) {
      toast.show(e?.message ?? "Error", "info");
    }
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {data.create}
          </button>
        }
      >
        <DataTable
          columns={columns}
          rows={items.map((i: any) => ({ ...i }))}
          actions={[
            { label: data.actions?.edit ?? "Editar", onClick: (row) => openEdit(row) },
            {
              label: data.actions?.delete ?? "Eliminar",
              onClick: (row) => handleDelete(row),
            },
          ]}
        />
      </AdminSection>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? data.modal.editTitle : data.modal.createTitle}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.name}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={data.modal.namePh}
              className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.category}</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{data.modal.categoryPlaceholder}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.description}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={data.modal.descriptionPh}
              rows={3}
              className="mt-1 w-full rounded-lg bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.status}</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40"
            >
              {Object.entries(data.statuses).map(([k, v]) => (
                <option key={k} value={k}>
                  {String(v)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {data.modal.save}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
            >
              {data.modal.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
