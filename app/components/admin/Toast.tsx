"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<{ show: (msg: string, type?: ToastType) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const show = useCallback((message: string, type: ToastType = "success") => {
    if (type === "error") toast.error(message, { duration: 5500 });
    else if (type === "info") toast.info(message, { duration: 3500 });
    else toast.success(message, { duration: 3500 });
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>{children}</ToastContext.Provider>
  );
}
