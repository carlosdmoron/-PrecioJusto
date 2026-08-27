import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente de servicio: bypasea RLS. SOLO usar en server actions / route handlers.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
