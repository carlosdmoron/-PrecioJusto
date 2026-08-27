"use client";

import Swal from "sweetalert2";

const styles = {
  confirmButtonColor: "#2563eb",
  cancelButtonColor: "#64748b",
  background: "#f8fafc",
};

export function sweetSuccess(title: string, text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: styles.confirmButtonColor,
    background: styles.background,
    timer: 2500,
    timerProgressBar: true,
  });
}

export function sweetError(title: string, text?: string) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: styles.confirmButtonColor,
    background: styles.background,
  });
}

export function sweetInfo(title: string, text?: string) {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: styles.confirmButtonColor,
    background: styles.background,
  });
}

export async function sweetConfirmDelete(title: string, text?: string) {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: styles.cancelButtonColor,
    background: styles.background,
  });
  return result.isConfirmed;
}
