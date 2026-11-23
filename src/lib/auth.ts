import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Returns the admin user or null. Verifies both a valid session AND admin_users membership. */
export async function getAdmin() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  return row ? data.user : null;
}

/** For server components / layouts. */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For API routes. Returns a 401/403 response, or null when authorized. */
export async function adminGuard() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}
