import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/util";

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  const name_en = String(b?.name_en ?? "").trim().slice(0, 60);
  const name_ar = String(b?.name_ar ?? "").trim().slice(0, 60);
  if (!name_en || !name_ar) return NextResponse.json({ error: "names_required" }, { status: 400 });
  const slug = slugify(String(b?.slug || name_en));
  const { data, error } = await supabaseServer().from("categories").insert({ name_en, name_ar, slug }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "slug_exists" : "db_error" }, { status: 400 });
  return NextResponse.json({ category: data });
}
