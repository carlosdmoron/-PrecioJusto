"use client";

import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { ToastProvider as TP } from "../../components/admin/Toast";

export default function AdminToastWrapper({ children }: { children: ReactNode }) {
  return (
    <TP>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "14px",
            fontFamily: "var(--font-figtree), var(--font-inter), sans-serif",
          },
        }}
      />
    </TP>
  );
}
