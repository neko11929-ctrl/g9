import { createClient } from "@supabase/supabase-js";

/** Anonymous, cookie-free client. RLS still applies (published rows only). */
export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
