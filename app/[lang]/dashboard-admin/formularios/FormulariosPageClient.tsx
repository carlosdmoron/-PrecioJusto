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
  updateFormService,
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
  const [editingForm, setEditingForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string>("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const defaultChoiceOptions = () => ["A", "B", "C", "D"];

  const normalizeQuestions = (qs: Question[]): Question[] =>
    qs.map((q) => {
      const isChoice = q.type === "radio" || q.type === "checkbox" || q.type === "select";
      return {
        ...q,
        options: isChoice && (!q.options || q.options.length === 0)
          ? defaultChoiceOptions()
          : q.options ?? [],
      };
    });

  const openBuilderForNew = async (id: string) => {
    setSelectedFormId(id);
    setEditingForm(false);
    setEditingServiceId("");
    setQuestions([]);
    setShowModal(false);
    setShowBuilder(true);
  };

  const openBuilderForEdit = async (id: string) => {
    setSelectedFormId(id);
    setEditingForm(true);
    setLoadingQuestions(true);
    setQuestions([]);
    setShowBuilder(true);
    try {
      const detail = await getForm(id);
      if (!detail) {
        toast.show(data.builder.notFound);
        setShowBuilder(false);
        return;
      }
      setEditingServiceId(detail.form.service_id ?? "");
      setQuestions(normalizeQuestions(detail.questions ?? []));
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
      setShowBuilder(false);
    } finally {
      setLoadingQuestions(false);
    }
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

  const addQuestion = (typeOverride?: string) => {
    setQuestions((prev) => {
      const type = typeOverride ?? "textarea";
      const isChoice = type === "radio" || type === "checkbox" || type === "select";
      return [
        ...prev,
        {
          label: data.builder.newQuestionLabel,
          type,
          required: false,
          options: isChoice ? defaultChoiceOptions() : [],
        },
      ];
    });
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const changeQuestionType = (index: number, type: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const isChoice = type === "radio" || type === "checkbox" || type === "select";
        if (isChoice) {
          return {
            ...q,
            type,
            options:
              q.options && q.options.length > 0 ? q.options : defaultChoiceOptions(),
          };
        }
        return { ...q, type, options: [] };
      })
    );
  };

  const updateOption = (index: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const options = [...(q.options ?? [])];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };

  const addOption = (index: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? { ...q, options: [...(q.options ?? []), `Opción ${(q.options?.length ?? 0) + 1}`] }
          : q
      )
    );
  };

  const removeOption = (index: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? { ...q, options: (q.options ?? []).filter((_, oi) => oi !== optIndex) }
          : q
      )
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const publishWithSave = async (formId: string) => {
    if (editingForm) {
      await updateFormService(formId, editingServiceId);
    }
    const saved = await updateFormQuestions(formId, questions);
    if (!saved) {
      throw new Error(data.feedback.formError);
    }
    await publishForm(formId);
  };

  const saveQuestions = async () => {
    if (!selectedFormId) return;
    setSaving(true);
    try {
      if (editingForm) {
        await updateFormService(selectedFormId, editingServiceId);
      }
      const saved = await updateFormQuestions(selectedFormId, questions);
      if (!saved) {
        toast.show(data.feedback.formError);
        return;
      }
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
    setSaving(true);
    try {
      await publishWithSave(selectedFormId);
      toast.show(data.feedback.formPublished);
      setShowBuilder(false);
      router.refresh();
    } catch (e: any) {
      toast.show(e.message ?? data.feedback.formError);
    } finally {
      setSaving(false);
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
        title={editingForm ? data.builder.editTitle : data.builder.createTitle}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-3">
          {editingForm && (
            <div>
              <label className="text-xs font-medium text-muted">
                {data.modal.service}
              </label>
              <select
                value={editingServiceId}
                onChange={(e) => setEditingServiceId(e.target.value)}
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
          )}
          {loadingQuestions && (
            <p className="text-sm text-muted">{data.builder.loading}</p>
          )}
          {!loadingQuestions && questions.length === 0 && (
            <p className="text-sm text-muted">{data.builder.empty}</p>
          )}
          {questions.map((q, index) => {
            const isChoice =
              q.type === "radio" || q.type === "checkbox" || q.type === "select";
            return (
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
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex gap-3">
                    <input
                      value={q.label}
                      onChange={(e) => updateQuestion(index, { label: e.target.value })}
                      className="min-w-0 flex-1 rounded-md bg-field px-2 py-1 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={isChoice ? "choice" : "free"}
                      onChange={(e) =>
                        changeQuestionType(
                          index,
                          e.target.value === "choice" ? "radio" : "textarea"
                        )
                      }
                      className="h-8 rounded-md bg-field px-2 text-xs text-ink outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="free">{data.builder.questionTypeLabels.free}</option>
                      <option value="choice">
                        {data.builder.questionTypeLabels.choice}
                      </option>
                    </select>
                    <span className="text-xs text-muted">
                      {data.builder.questionTypes[q.type]}
                    </span>
                    <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(index, { required: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      {data.builder.required}
                    </label>
                  </div>
                  {isChoice && (
                    <div className="space-y-1.5 pl-1">
                      <p className="text-[11px] font-medium text-faint">
                        {data.builder.choicesLabel}
                      </p>
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="w-4 shrink-0 text-xs font-semibold text-primary-dark">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <input
                            value={opt}
                            onChange={(e) => updateOption(index, oi, e.target.value)}
                            className="h-8 w-full rounded-md bg-field px-2 text-xs text-ink outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index, oi)}
                            disabled={(q.options?.length ?? 0) <= 2}
                            className="shrink-0 text-xs text-faint transition hover:text-danger disabled:opacity-30"
                            aria-label={data.builder.removeOptionLabel}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(index)}
                        className="mt-1 text-xs font-medium text-primary-dark transition hover:underline"
                      >
                        + {data.builder.addOptionLabel}
                      </button>
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
            );
          })}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => addQuestion("textarea")}
              className="w-full rounded-lg border border-dashed border-line/60 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark"
            >
              + {data.builder.questionTypeLabels.free}
            </button>
            <button
              type="button"
              onClick={() => addQuestion("radio")}
              className="w-full rounded-lg border border-dashed border-line/60 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark"
            >
              + {data.builder.questionTypeLabels.choice}
            </button>
          </div>
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
