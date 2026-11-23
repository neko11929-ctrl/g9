import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/util";

/** Produces e.g. "moonlight-001", "moonlight-002"… guaranteed unused at call time. */
export async function uniqueSlug(supabase: SupabaseClient, title: string) {
  const base = slugify(title);
  const { count } = await supabase.from("wallpapers").select("id", { count: "exact", head: true });
  let n = (count ?? 0) + 1;
  for (let i = 0; i < 50; i++, n++) {
    const slug = `${base}-${String(n).padStart(3, "0")}`;
    const { data } = await supabase.from("wallpapers").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}
