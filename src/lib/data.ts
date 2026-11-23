import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { Category, Wallpaper } from "@/lib/util";

const CARD_FIELDS =
  "id,title,slug,description,thumbnail_key,preview_key,resolution,file_size,featured,download_count,created_at,category_id,published,categories(id,name_en,name_ar,slug)";

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabaseServer().from("categories").select("*").order("created_at");
  return (data as Category[]) ?? [];
}

export type ListParams = {
  q?: string;
  cat?: string;
  res?: string;
  sort?: "new" | "popular";
  page?: number;
  pageSize?: number;
  featured?: boolean;
};

export async function listWallpapers(p: ListParams = {}) {
  const supabase = supabaseServer();
  const pageSize = p.pageSize ?? 12;
  const page = Math.max(1, p.page ?? 1);
  const select = p.res ? `${CARD_FIELDS},wallpaper_files!inner(label)` : CARD_FIELDS;
  let query = supabase.from("wallpapers").select(select, { count: "exact" }).eq("published", true);

  if (p.featured) query = query.eq("featured", true);
  if (p.res) query = query.eq("wallpaper_files.label", p.res);
  if (p.cat) {
    const { data: c } = await supabase.from("categories").select("id").eq("slug", p.cat).maybeSingle();
    if (c) query = query.eq("category_id", c.id);
    else return { items: [] as Wallpaper[], total: 0, pageSize };
  }
  const q = (p.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  query =
    p.sort === "popular"
      ? query.order("download_count", { ascending: false }).order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);
  return { items: ((data as unknown) as Wallpaper[]) ?? [], total: count ?? 0, pageSize };
}

export async function getWallpaperBySlug(slug: string) {
  const { data } = await supabaseServer()
    .from("wallpapers")
    .select("*,categories(id,name_en,name_ar,slug),wallpaper_files(id,wallpaper_id,label,resolution,file_size,storage_key)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as unknown as Wallpaper | null) ?? null;
}

export async function getRelated(w: Wallpaper, limit = 4) {
  const supabase = supabaseServer();
  let q = supabase.from("wallpapers").select(CARD_FIELDS).eq("published", true).neq("id", w.id);
  if (w.category_id) q = q.eq("category_id", w.category_id);
  const { data } = await q.order("download_count", { ascending: false }).limit(limit);
  return ((data as unknown) as Wallpaper[]) ?? [];
}
