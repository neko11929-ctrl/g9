import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { uniqueSlug } from "@/lib/slug";
import { cleanFiles, cleanMeta, verifyFile, verifyPreview, verifyThumb } from "@/lib/wallpaperInput";
import { siteUrl } from "@/lib/util";

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const meta = cleanMeta(b);
  if (!meta.title) return NextResponse.json({ error: "title_required" }, { status: 400 });
  const files = cleanFiles(b.files);
  const original = files?.find((f) => f.label === "Original");
  if (!files || !original) return NextResponse.json({ error: "original_required" }, { status: 400 });

  const sizes: number[] = [];
  for (const f of files) {
    const size = await verifyFile(f.key);
    if (!size) return NextResponse.json({ error: "file_missing", key: f.key }, { status: 400 });
    sizes.push(size);
  }
  const publish = b.published === true;
  const hasThumb = await verifyThumb(b.thumbnail_key);
  if (publish && !hasThumb) return NextResponse.json({ error: "thumbnail_required" }, { status: 400 });
  const hasPreview = b.preview_key ? await verifyPreview(b.preview_key) : false;

  const supabase = supabaseServer();
  const slug = await uniqueSlug(supabase, String(meta.title));
  const originalSize = sizes[files.indexOf(original)];
  const { data: w, error } = await supabase
    .from("wallpapers")
    .insert({
      ...meta,
      slug,
      thumbnail_key: hasThumb ? b.thumbnail_key : null,
      preview_key: hasPreview ? b.preview_key : null,
      format: original.key.split(".").pop(),
      file_size: originalSize,
      source_type: "upload",
      published: publish,
    })
    .select("id,slug")
    .single();
  if (error || !w) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { error: fErr } = await supabase.from("wallpaper_files").insert(
    files.map((f, i) => ({ wallpaper_id: w.id, label: f.label, resolution: f.resolution ?? null, storage_key: f.key, file_size: sizes[i] }))
  );
  if (fErr) {
    await supabase.from("wallpapers").delete().eq("id", w.id);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ id: w.id, slug: w.slug, url: `${siteUrl()}/v/${w.slug}`, published: publish });
}
