"use server";

import { createAdminClient } from "../../lib/supabase/admin";

// Sube una imagen adjunta de un formulario (cliente o profesional) al bucket
// público form-attachments y devuelve su URL pública. No exige sesión porque
// el registro de profesionales y la solicitud de clientes admiten invitados que
// todavía no tienen cuenta: suben la foto primero y crean la cuenta al enviar.
// Solo admite imágenes y un máximo de 5 MB.
export async function uploadFormAttachment(
  formData: FormData
): Promise<{ url: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No se recibió ninguna imagen.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG, WebP...).");
  }
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen supera el tamaño máximo de 5 MB.");
  }

  const admin = createAdminClient();
  const BUCKET = "form-attachments";

  const { error: bucketError } = await admin.storage.createBucket(BUCKET, {
    public: true,
  });
  const bucketExists = Boolean(
    bucketError &&
      String(bucketError.message ?? "").toLowerCase().includes("exists")
  );
  if (bucketError && !bucketExists) {
    throw new Error(
      bucketError.message ?? "No se pudo preparar el almacenamiento de fotos."
    );
  }

  const ext = (file.name.split(".").pop() ?? "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: upError } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
  if (upError) throw new Error(upError.message);

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}