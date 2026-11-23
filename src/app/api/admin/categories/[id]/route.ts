import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/util";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  const name_en = String(b?.name_en ?? "").trim().slice(0, 60);
  const name_ar = String(b?.name_ar ?? "").trim().slice(0, 60);
  if (!name_en || !name_ar) return NextResponse.json({ error: "names_required" }, { status: 400 });
  const slug = slugify(String(b?.slug || name_en));
  const { error } = await supabaseServer().from("categories").update({ name_en, name_ar, slug }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.code === "23505" ? "slug_exists" : "db_error" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { error } = await supabaseServer().from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
