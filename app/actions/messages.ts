"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("conversations")
    .select(`
      *,
      professionals:profiles!conversations_professional_id_fkey(first_name, last_name)
    `)
    .eq("client_id", user.id)
    .order("last_message_at", { ascending: false });

  return data ?? [];
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function sendMessage(conversationId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    text,
  });

  if (error) throw error.message;

  await supabase
    .from("conversations")
    .update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  revalidatePath("/dashboard-cliente/mensajes", "page");
  return { success: true };
}
