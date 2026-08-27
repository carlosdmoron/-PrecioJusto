"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export type AdminServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  category: string | null;
  requests_count: number | null;
  revenue: number | null;
};

export type AdminServiceInput = {
  name: string;
  slug: string;
  description?: string;
  status: string;
  category_id?: string | null;
};

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, status")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    status: string | null;
  }>;
}

export async function listServices(): Promise<AdminServiceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, slug, description, status, requests_count, revenue, category:categories(name)"
    )
    .order("name");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    requests_count: number | null;
    revenue: number | null;
    category: { name: string } | { name: string }[] | null;
  }>;

  return rows.map((s) => {
    const cat = Array.isArray(s.category) ? s.category[0] : s.category;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? null,
      status: s.status,
      requests_count: s.requests_count ?? 0,
      revenue: s.revenue ?? 0,
      category: cat?.name ?? null,
    };
  });
}

export async function createService(input: AdminServiceInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    status: input.status,
    category_id: input.category_id ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard-admin/servicios");
  return { success: true };
}

export async function updateService(id: string, input: AdminServiceInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
      status: input.status,
      category_id: input.category_id ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard-admin/servicios");
  return { success: true };
}

export async function setServiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard-admin/servicios");
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard-admin/servicios");
  return { success: true };
}
