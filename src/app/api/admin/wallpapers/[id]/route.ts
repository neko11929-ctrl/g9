import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteObject, PRIVATE_BUCKET, PUBLIC_BUCKET } from "@/lib/r2";
import { cleanFiles, cleanMeta, verifyFile, verifyPreview, verifyThumb } from "@/lib/wallpaperInput";

const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!UUID.test(params.id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const supabase = supabaseServer();
  const { data: cur } = await supabase.from("wallpapers").select("id,thumbnail_key,preview_key,published").eq("id", params.id).maybeSingle();
  if (!cur) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const update: Record<string, unknown> = cleanMeta(b);
  if ("title" in update && !update.title) return NextResponse.json({ error: "title_required" }, { status: 400 });
  const oldPublicKeys: string[] = [];

  if (b.thumbnail_key) {
    if (!(await verifyThumb(b.thumbnail_key))) return NextResponse.json({ error: "thumbnail_missing" }, { status: 400 });
    update.thumbnail_key = b.thumbnail_key;
    if (cur.thumbnail_key && cur.thumbnail_key !== b.thumbnail_key) oldPublicKeys.push(cur.thumbnail_key);
  }
  if (b.preview_key) {
    if (!(await verifyPreview(b.preview_key))) return NextResponse.json({ error: "preview_missing" }, { status: 400 });
    update.preview_key = b.preview_key;
    if (cur.preview_key && cur.preview_key !== b.preview_key) oldPublicKeys.push(cur.preview_key);
  }
  if (b.remove_preview === true && cur.preview_key) { update.preview_key = null; oldPublicKeys.push(cur.preview_key); }

  // files: add / replace by label, remove by id
  const oldPrivateKeys: string[] = [];
  const add = cleanFiles(b.addFiles);
  if (add === null) return NextResponse.json({ error: "bad_files" }, { status: 400 });
  for (const f of add) {
    const size = await verifyFile(f.key);
    if (!size) return NextResponse.json({ error: "file_missing", key: f.key }, { status: 400 });
    const { data: existing } = await supabase.from("wallpaper_files").select("id,storage_key").eq("wallpaper_id", cur.id).eq("label", f.label).maybeSingle();
    if (existing) {
      await supabase.from("wallpaper_files").update({ storage_key: f.key, file_size: size, resolution: f.resolution ?? null }).eq("id", existing.id);
      if (existing.storage_key !== f.key) oldPrivateKeys.push(existing.storage_key);
    } else {
      await supabase.from("wallpaper_files").insert({ wallpaper_id: cur.id, label: f.label, resolution: f.resolution ?? null, storage_key: f.key, file_size: size });
    }
    if (f.label === "Original") { update.file_size = size; update.format = f.key.split(".").pop(); }
  }
  if (Array.isArray(b.removeFileIds)) {
    for (const fid of b.removeFileIds.filter((x: unknown) => typeof x === "string" && UUID.test(x))) {
      const { data: f } = await supabase.from("wallpaper_files").select("id,label,storage_key").eq("id", fid).eq("wallpaper_id", cur.id).maybeSingle();
      if (f && f.label !== "Original") {
        await supabase.from("wallpaper_files").delete().eq("id", f.id);
        oldPrivateKeys.push(f.storage_key);
      }
    }
  }

  if (typeof b.published === "boolean") {
    if (b.published) {
      const thumb = (update.thumbnail_key as string | undefined) ?? cur.thumbnail_key;
      const { count } = await supabase.from("wallpaper_files").select("id", { count: "exact", head: true }).eq("wallpaper_id", cur.id).eq("label", "Original");
      if (!thumb) return NextResponse.json({ error: "thumbnail_required" }, { status: 400 });
      if (!count) return NextResponse.json({ error: "original_required" }, { status: 400 });
    }
    update.published = b.published;
  }

  if (Object.keys(update).length) {
    const { error } = await supabase.from("wallpapers").update(update).eq("id", cur.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  await Promise.all([
    ...oldPublicKeys.map((k) => deleteObject(PUBLIC_BUCKET, k)),
    ...oldPrivateKeys.map((k) => deleteObject(PRIVATE_BUCKET, k)),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!UUID.test(params.id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  const supabase = supabaseServer();
  const { data: w } = await supabase.from("wallpapers").select("id,thumbnail_key,preview_key,wallpaper_files(storage_key)").eq("id", params.id).maybeSingle();
  if (!w) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { error } = await supabase.from("wallpapers").delete().eq("id", w.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  const files = (w.wallpaper_files as { storage_key: string }[]) ?? [];
  await Promise.all([
    ...files.map((f) => deleteObject(PRIVATE_BUCKET, f.storage_key)),
    deleteObject(PUBLIC_BUCKET, w.thumbnail_key),
    deleteObject(PUBLIC_BUCKET, w.preview_key),
  ]);
  return NextResponse.json({ ok: true });
}
