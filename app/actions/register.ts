"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";

export type RegisterState = { error?: string; ok?: boolean; needsConfirmation?: boolean };

// Crea el usuario directamente en la base de datos (Supabase Auth + profiles)
// y persiste el perfil con service_role para garantizar que quede en la DB
// aunque el trigger handle_new_user no cree el profile por si solo.
export async function registerCliente(
  lang: string,
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Email inválido" };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "client", first_name: firstName, last_name: lastName },
    },
  });

  // El usuario ya existe en auth a pesar del fallo del trigger en algunos casos;
  // si signUp devuelve error, no es seguro continuar.
  if (error) {
    // error.message suele ser "Database error saving new user" cuando el trigger
    // falla por permisos (ver design/supabase-fix-trigger.sql).
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (userId) {
    await persistProfile(userId, email, "client", firstName, lastName);
  }

  const confirmed = Boolean(data.user && !data.session);
  return { ok: true, needsConfirmation: confirmed };
}

export async function registerProfesional(
  lang: string,
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Email inválido" };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "professional", first_name: firstName, last_name: lastName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;
  if (userId) {
    await persistProfile(userId, email, "professional", firstName, lastName);
  }

  const confirmed = Boolean(data.user && !data.session);
  return { ok: true, needsConfirmation: confirmed };
}

// Upsert del perfil con service_role (bypasea RLS) -> queda grabado en la DB.
async function persistProfile(
  userId: string,
  email: string,
  role: "client" | "professional",
  firstName: string,
  lastName: string
) {
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .upsert(
      { id: userId, email, role, first_name: firstName, last_name: lastName },
      { onConflict: "id" }
    );
}

export async function redirectAfterRegister(lang: string, role: string) {
  if (role === "professional") redirect(`/${lang}/dashboard-profesional`);
  redirect(`/${lang}/dashboard-cliente`);
}
