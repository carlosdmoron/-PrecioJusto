"use client";

import { createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

const DURATION_OK = 3500;
const DURATION_ERR = 5500;

export function sweetSuccess(title: string, text?: string) {
  toast.success(title, { description: text, duration: DURATION_OK });
}

export function sweetError(title: string, text?: string) {
  toast.error(title, { description: text, duration: DURATION_ERR });
}

export function sweetInfo(title: string, text?: string) {
  toast.info(title, { description: text, duration: DURATION_OK });
}

type ConfirmOptions = {
  title: string;
  text?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const dialogCss = `
@keyframes pjFadeIn{from{opacity:0}to{opacity:1}}
@keyframes pjPopIn{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
`;

function TrashIcon() {
  return createElement(
    "svg",
    {
      width: 22,
      height: 22,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    },
    createElement("path", { d: "M3 6h18" }),
    createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }),
    createElement("path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
    createElement("line", { x1: 10, y1: 11, x2: 10, y2: 17 }),
    createElement("line", { x1: 14, y1: 11, x2: 14, y2: 17 })
  );
}

function ConfirmDialog({
  title,
  text,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmOptions) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createElement(
    "div",
    {
      className:
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
      role: "dialog",
      "aria-modal": true,
      "aria-label": title,
    },
    createElement("style", null, dialogCss),
    createElement("div", {
      className:
        "absolute inset-0 bg-gray-950/45 backdrop-blur-[6px] [animation:pjFadeIn_.18s_ease-out]",
      onClick: onCancel,
    }),
    createElement(
      "div",
      {
        className:
          "relative w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-gray-900/5 [animation:pjPopIn_.22s_cubic-bezier(.16,1,.3,1)]",
      },
      createElement(
        "div",
        {
          className:
            "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50",
        },
        createElement(TrashIcon)
      ),
      createElement(
        "h2",
        { className: "mt-4 text-center text-lg font-semibold text-gray-900" },
        title
      ),
      text
        ? createElement(
            "p",
            {
              className:
                "mt-1.5 text-center text-sm leading-relaxed text-gray-500",
            },
            text
          )
        : null,
      createElement(
        "div",
        { className: "mt-6 grid grid-cols-2 gap-3" },
        createElement(
          "button",
          {
            type: "button",
            onClick: onCancel,
            className:
              "h-11 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[.98]",
          },
          cancelText
        ),
        createElement(
          "button",
          {
            type: "button",
            autoFocus: true,
            onClick: onConfirm,
            className:
              "h-11 rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-sm shadow-red-600/30 transition hover:bg-red-700 active:scale-[.98]",
          },
          confirmText
        )
      )
    )
  );
}

function openConfirmDialog(opts: {
  title: string;
  text?: string;
  confirmText: string;
  cancelText: string;
}): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const cleanup = (result: boolean) => {
      root.unmount();
      host.remove();
      resolve(result);
    };
    root.render(
      createElement(ConfirmDialog, {
        title: opts.title,
        text: opts.text,
        confirmText: opts.confirmText,
        cancelText: opts.cancelText,
        onConfirm: () => cleanup(true),
        onCancel: () => cleanup(false),
      })
    );
  });
}

export function sweetConfirmDelete(
  title: string,
  text?: string,
  confirmButtonText = "Sí, eliminar",
  cancelButtonText = "Cancelar"
) {
  return openConfirmDialog({
    title,
    text,
    confirmText: confirmButtonText,
    cancelText: cancelButtonText,
  });
}
