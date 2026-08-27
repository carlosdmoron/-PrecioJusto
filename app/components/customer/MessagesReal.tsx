"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Modal from "../dashboard/Modal";
import { getMessages, sendMessage } from "../../actions/messages";

type Conversation = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  professionals?: { first_name: string | null; last_name: string | null } | null;
};

type Message = {
  id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
};

type MessagesData = {
  title: string;
  subtitle: string;
  hilo: {
    placeholder: string;
    enviar: string;
  };
};

function getInitials(first?: string | null, last?: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function getName(prof?: { first_name: string | null; last_name: string | null } | null) {
  return [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") || "Profesional";
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesReal({
  data,
  conversations: initialConversations,
  currentUserId,
}: {
  data: MessagesData;
  conversations: Conversation[];
  currentUserId: string | null;
}) {
  const [conversations] = useState(initialConversations);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conv = openIdx === null ? null : conversations[openIdx];

  useEffect(() => {
    if (conv) {
      setLoading(true);
      getMessages(conv.id).then((msgs) => {
        setThread(msgs);
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
    }
  }, [conv]);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !conv) return;
    setDraft("");
    setThread((prev) => [
      ...prev,
      { id: "temp", sender_id: currentUserId ?? "me", text, read: false, created_at: new Date().toISOString() },
    ]);
    try {
      await sendMessage(conv.id, text);
    } catch {
      // Error handled silently
    }
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{data.subtitle}</p>

      {conversations.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line/40 bg-white p-10 text-center text-sm text-muted">
          No tienes conversaciones activas.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversations.map((c, index) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenIdx(index)}
                className="flex w-full items-center gap-4 rounded-xl border border-line/40 bg-white p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-badge text-sm font-semibold text-primary-dark">
                  {getInitials(c.professionals?.first_name, c.professionals?.last_name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-ink">{getName(c.professionals)}</span>
                    <span className="shrink-0 text-xs text-muted">{formatTime(c.last_message_at)}</span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">{c.last_message ?? "Sin mensajes"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={conv !== null} onClose={() => setOpenIdx(null)} title={conv ? getName(conv.professionals) : ""} closeLabel={data.title}>
        {conv ? (
          <>
            <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
              {loading ? (
                <p className="py-4 text-center text-sm text-muted">Cargando mensajes...</p>
              ) : thread.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">No hay mensajes todavia.</p>
              ) : (
                thread.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.sender_id === currentUserId
                          ? "rounded-br-sm bg-primary text-white"
                          : "rounded-bl-sm bg-panel text-ink"
                      }`}
                    >
                      {m.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="mt-6 flex gap-3 border-t border-line/30 pt-5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={data.hilo.placeholder}
                aria-label={data.hilo.placeholder}
                className="h-12 w-full flex-1 rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                {data.hilo.enviar}
              </button>
            </form>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
