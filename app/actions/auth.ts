"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { shouldShowDashboardChooser } from "../../lib/guards";

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

  if (shouldShowDashboardChooser(email)) {
    redirect(`/${lang}/dashboard-elegir`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .maybeSingle();

  const role = (profile?.role as string) ?? "client";

  if (role === "admin") {
    redirect(`/${lang}/dashboard-admin`);
  }
  if (role === "professional") {
    // Si el profesional está bloqueado (o su perfil baneado) no se le permite
    // entrar: se cierra la sesión recién creada y se muestra el error.
    const status = profile?.status as string | undefined;
    const isBlocked =
      status === "banned" ||
      status === "blocked" ||
      (await isProfessionalBlocked(supabase));

    if (isBlocked) {
      await supabase.auth.signOut();
      return {
        error:
          "Tu cuenta ha sido bloqueada. Si crees que es un error, contacta con soporte.",
      };
    }
    redirect(`/${lang}/dashboard-profesional`);
  }
  redirect(`/${lang}/dashboard-cliente`);
}

// Login sin redirección: se usa desde el formulario de solicitud de la landing
// para que el usuario inicie sesión sin salir de la página. Devuelve { ok, role }
// y el cliente decide cómo continuar (crear la solicitud o redirigir a su panel).
export async function loginInline(
  lang: string,
  _prevState: { error?: string; ok?: boolean; role?: string },
  formData: FormData
): Promise<{ error?: string; ok?: boolean; role?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .maybeSingle();

  const role = (profile?.role as string) ?? "client";

  if (role === "professional") {
    const status = profile?.status as string | undefined;
    const isBlocked =
      status === "banned" ||
      status === "blocked" ||
      (await isProfessionalBlocked(supabase));

    if (isBlocked) {
      await supabase.auth.signOut();
      return {
        error:
          "Tu cuenta ha sido bloqueada. Si crees que es un error, contacta con soporte.",
      };
    }
  }

  return { ok: true, role };
}

async function isProfessionalBlocked(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: prof } = await supabase
    .from("professionals")
    .select("admin_status")
    .eq("id", user.id)
    .maybeSingle();
  return prof?.admin_status === "blocked";
}

export async function logout(lang: string = "es") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${lang}/iniciar-sesion`);
}
