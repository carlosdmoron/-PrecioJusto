"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function login(
  lang: string,
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .maybeSingle();

  const role = (profile?.role as string) ?? "client";

  if (role === "professional" || role === "admin") {
    redirect(`/${lang}/dashboard-profesional`);
  }
  redirect(`/${lang}/dashboard-cliente`);
}

export async function logout(lang: string = "es") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}/iniciar-sesion`);
}
