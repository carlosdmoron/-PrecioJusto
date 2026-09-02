"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import { sweetSuccess, sweetError, sweetConfirmDelete } from "../../../components/admin/sweetAlert";
import type { TableRow } from "../../../components/admin/DataTable";
import {
  createService,
  updateService,
  deleteService,
} from "../../../actions/admin";

type Cat = { id: string; name: string; slug: string };

const GALLERY_IMAGES = [
  "/images/prof-electricista.jfif",
  "/images/prof-carpintero.jfif",
  "/images/prof-fontanero.jfif",
  "/images/prof-service-1.jpg",
  "/images/prof-service-2.jpg",
  "/images/prof-service-3.jpg",
  "/images/prof-service-4.jpg",
  "/images/prof-service-5.jpg",
  "/images/prof-service-6.jpg",
];

export default function ServiciosPageClient({ data }: { data: any }) {
  const toast = useToast();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TableRow | null>(null);
  const [items, setItems] = useState(data.items ?? []);
  const categories: Cat[] = data.categories ?? [];

  useEffect(() => {
    setItems((prev: any[]) => {
      const next = data.items ?? [];
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [data.items]);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    image_url: "",
    status: "draft",
    slug: "",
  });
  const [saving, setSaving] = useState(false);

  const columns = [
    { key: "name", label: data.table.name },
    { key: "category", label: data.table.category, render: (row: any) => row.category ?? "—" },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    { key: "requests_count", label: data.table.requests },
    {
      key: "revenue",
      label: data.table.revenue,
      render: (row: any) => `€${Number(row.revenue ?? 0).toLocaleString()}`,
    },
  ];

  function openCreate() {
    setEditingItem(null);
    setForm({ name: "", category_id: "", description: "", image_url: "", status: "draft", slug: "" });
    setShowModal(true);
  }

  function openEdit(row: TableRow) {
    setEditingItem(row);
    const selected = categories.find((c) => c.name === row.category);
    setForm({
      name: String(row.name ?? ""),
      category_id: selected?.id ?? "",
      description: String(row.description ?? ""),
      image_url: String(row["image_url"] ?? ""),
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
        image_url: form.image_url,
        status: form.status,
        category_id: form.category_id || null,
      };
      if (editingItem) {
        await updateService(String(editingItem.id), payload);
        await sweetSuccess(data.feedback.updated);
      } else {
        await createService(payload);
        await sweetSuccess(data.feedback.created);
      }
      router.refresh();
      setShowModal(false);
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: TableRow) {
    const confirmed = await sweetConfirmDelete(
      data.feedback.confirmDeleteTitle,
      data.feedback.confirmDeleteText,
      data.feedback.confirmYes,
      data.feedback.confirmCancel
    );
    if (!confirmed) return;
    try {
      await deleteService(String(row.id));
      setItems((prev: any[]) => prev.filter((it: any) => it.id !== row.id));
      await sweetSuccess(data.feedback.deleted);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.deleteVerifyError);
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
            { label: data.actions?.edit ?? "Edit", onClick: (row) => openEdit(row) },
            {
              label: data.actions?.delete ?? "Delete",
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
            <label className="text-xs font-medium text-muted">{data.modal.imageUrl}</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-line/60 bg-field">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image_url}
                    alt={form.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-muted">{data.modal.imageNone}</span>
                )}
              </div>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder={data.modal.imageUrlPh}
                className="h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.modal.imageGallery}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {GALLERY_IMAGES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setForm({ ...form, image_url: src })}
                  className={`group relative h-16 overflow-hidden rounded-lg border-2 bg-field transition ${
                    form.image_url === src
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-primary/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={src}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {form.image_url === src && (
                    <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-white">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, image_url: "" })}
              className="mt-2 text-xs font-medium text-steel underline-offset-2 hover:text-ink hover:underline"
            >
              {data.modal.imageNone}
            </button>
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
