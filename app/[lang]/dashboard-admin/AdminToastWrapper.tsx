"use client";

import { type ReactNode } from "react";
import { ToastProvider as TP } from "../../components/admin/Toast";

export default function AdminToastWrapper({ children }: { children: ReactNode }) {
  return <TP>{children}</TP>;
}
