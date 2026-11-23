import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/public";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public: published wallpapers by id (used by the local-only Favorites page).
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .filter((i) => UUID.test(i))
    .slice(0, 60);
  if (!ids.length) return NextResponse.json({ items: [] });
  const { data, error } = await supabasePublic()
    .from("wallpapers")
    .select("id,title,slug,thumbnail_key,preview_key,resolution,categories(id,name_en,name_ar,slug)")
    .in("id", ids)
    .eq("published", true);
  if (error) return NextResponse.json({ error: "failed" }, { status: 500 });
  return NextResponse.json({ items: data });
}
