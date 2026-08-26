"use server";

import { createClient } from "../../lib/supabase/server";

export async function getServices() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("id, name, slug, description, category:categories(name)")
    .eq("status", "published")
    .order("name");

  return data ?? [];
}

export async function getClientRequestCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id);

  return count ?? 0;
}
