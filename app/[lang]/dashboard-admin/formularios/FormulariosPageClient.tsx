"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";
import {
  createForm,
  getForm,
  updateFormQuestions,
  publishForm,
  duplicateForm,
  deleteForm,
} from "../../../actions/forms";

type Question = {
  id?: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
};

export default function FormulariosPageClient({ data }: { data: any }) {
  const router = useRouter();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const openBuilderForNew = async (id: string) => {
    setSelectedFormId(id);
    setQuestions([]);
    setShowModal(false);
    setShowBuilder(true);
  };

  const openBuilderForEdit = async (id: string) => {
    setSelectedFormId(id);
    try {
      const detail = await getForm(id);
      setQuestions(detail?.questions ?? []);
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
      return;
    }
    setShowBuilder(true);
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = null;
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        label: data.builder.newQuestionLabel,
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const saveQuestions = async () => {
    if (!selectedFormId) return;
    setSaving(true);
    try {
      await updateFormQuestions(selectedFormId, questions);
      toast.show(data.feedback.formSaved);
      setShowBuilder(false);
      router.refresh();
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    try {
      const id = await createForm(serviceId);
      toast.show(data.feedback.formCreated);
      await openBuilderForNew(id);
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    }
  };

  const handlePublish = async () => {
    if (!selectedFormId) return;
    try {
      await publishForm(selectedFormId);
      toast.show(data.feedback.formPublished);
      setShowBuilder(false);
      router.refresh();
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    }
  };

  const handleDuplicate = async (row: TableRow) => {
    try {
      await duplicateForm(row.id);
      toast.show(data.feedback.formDuplicated);
      router.refresh();
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    }
  };

  const handleDelete = async (row: TableRow) => {
    try {
      await deleteForm(row.id);
      toast.show(data.feedback.formDeleted);
      router.refresh();
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    }
  };

  const columns = [
    { key: "id", label: data.table.id },
    { key: "service", label: data.table.service },
    { key: "version", label: data.table.version },
    { key: "questions", label: data.table.questions },
    { key: "abandonment", label: data.table.abandonment },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {data.create}
          </button>
        }
      >
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            {
              label: data.actions.edit,
              onClick: (row) => openBuilderForEdit(row.id),
            },
            {
              label: data.actions.preview,
              onClick: () => {
                toast.show(data.feedback.formPreview);
              },
            },
            {
              label: data.actions.duplicate,
              onClick: (row) => handleDuplicate(row),
            },
            {
              label: data.actions.delete,
              onClick: (row) => handleDelete(row),
            },
          ]}
        />
      </AdminSection>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={data.modal.createTitle}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">
              {data.modal.service}
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{data.modal.servicePlaceholder}</option>
              {data.services.map((svc: any) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCreate}
              className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
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

      <Modal
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        title={data.builder.title}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-3">
          {questions.length === 0 && (
            <p className="text-sm text-muted">{data.builder.empty}</p>
          )}
          {questions.map((q, index) => (
            <div
              key={q.id ?? `new-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className="flex cursor-grab items-start gap-3 rounded-lg border border-line/30 bg-surface p-3 active:cursor-grabbing"
            >
              <span className="shrink-0 select-none text-lg leading-none text-faint">
                ⋮⋮
              </span>
              <div className="min-w-0 flex-1">
                <input
                  value={q.label}
                  onChange={(e) => updateQuestion(index, { label: e.target.value })}
                  className="w-full rounded-md bg-field px-2 py-1 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-xs text-muted">
                  {data.builder.questionTypes[q.type]}
                  {q.required && (
                    <span className="ml-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {data.builder.required}
                    </span>
                  )}
                </p>
                {q.options && q.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {q.options.map((opt: string) => (
                      <span
                        key={opt}
                        className="rounded-full bg-chip-blue px-2 py-0.5 text-xs text-primary-dark"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="shrink-0 text-xs text-faint transition hover:text-danger"
                aria-label={data.builder.removeQuestion}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-lg border border-dashed border-line/60 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark"
          >
            + {data.builder.addQuestion}
          </button>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={saveQuestions}
              disabled={saving}
              className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {data.builder.save}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="h-10 flex-1 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {data.builder.publish}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
