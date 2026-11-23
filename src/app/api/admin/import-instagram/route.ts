import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminGuard } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { uniqueSlug } from "@/lib/slug";
import { deleteObject, headObject, PRIVATE_BUCKET, PUBLIC_BUCKET, r2Configured, uploadStream } from "@/lib/r2";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 60;

const URL_RE = /^https:\/\/(www\.)?instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)\/?(\?.*)?$/;

type Media = { id: string; media_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string; caption?: string };

const fail = (code: string, status = 400) => NextResponse.json({ code }, { status });

/**
 * Official-API import only. Instagram's Graph API returns downloadable media_url
 * solely for media owned by the account the access token belongs to. Anything else
 * (other people's reels, private posts) is NOT importable and returns a clear error
 * so the admin can fall back to manual upload.
 */
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!rateLimit("ig-import", 10, 60_000)) return fail("rate_limited", 429);

  const body = await req.json().catch(() => null);
  const m = URL_RE.exec(String(body?.url ?? "").trim());
  if (!m) return fail("invalid_url");
  const shortcode = m[3];

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return fail("not_configured", 501);
  if (!r2Configured()) return fail("storage_not_configured", 503);

  // 1) find the media among the token owner's own media
  let found: Media | null = null;
  try {
    let next: string | undefined =
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=50&access_token=${encodeURIComponent(token)}`;
    for (let page = 0; page < 6 && next && !found; page++) {
      const r: Response = await fetch(next, { cache: "no-store" });
      if (!r.ok) return fail("api_error", 502);
      const j = (await r.json()) as { data?: Media[]; paging?: { next?: string } };
      found = j.data?.find((x) => x.permalink?.includes(`/${shortcode}/`)) ?? null;
      next = j.paging?.next;
    }
  } catch {
    return fail("api_error", 502);
  }
  if (!found) return fail("not_owned", 404);
  if (found.media_type !== "VIDEO") return fail("not_video");
  if (!found.media_url) return fail("no_media_url");

  // 2) copy the video into private storage
  const id = randomUUID();
  const videoKey = `originals/${id}.mp4`;
  let thumbKey: string | null = null;
  try {
    const v = await fetch(found.media_url);
    if (!v.ok || !v.body || !(v.headers.get("content-type") ?? "").startsWith("video/")) return fail("fetch_failed", 502);
    await uploadStream(PRIVATE_BUCKET, videoKey, v.body, "video/mp4");
    const head = await headObject(PRIVATE_BUCKET, videoKey);
    if (!head || head.size === 0) { await deleteObject(PRIVATE_BUCKET, videoKey); return fail("fetch_failed", 502); }

    if (found.thumbnail_url) {
      const t = await fetch(found.thumbnail_url).catch(() => null);
      if (t?.ok) {
        thumbKey = `thumbs/${id}.jpg`;
        await uploadStream(PUBLIC_BUCKET, thumbKey, Buffer.from(await t.arrayBuffer()), "image/jpeg");
      }
    }

    // 3) create an UNPUBLISHED draft. The admin reviews, picks a category and publishes.
    const supabase = supabaseServer();
    const title = (found.caption ?? "").split("\n")[0].trim().slice(0, 80) || "Untitled";
    const slug = await uniqueSlug(supabase, title);
    const { data: w, error } = await supabase
      .from("wallpapers")
      .insert({ title, slug, thumbnail_key: thumbKey, format: "mp4", file_size: head.size, source_type: "instagram", instagram_source_url: found.permalink, published: false })
      .select("id")
      .single();
    if (error || !w) throw new Error("db");
    const { error: fErr } = await supabase.from("wallpaper_files").insert({ wallpaper_id: w.id, label: "Original", storage_key: videoKey, file_size: head.size });
    if (fErr) { await supabase.from("wallpapers").delete().eq("id", w.id); throw new Error("db"); }
    return NextResponse.json({ id: w.id });
  } catch {
    await deleteObject(PRIVATE_BUCKET, videoKey);
    await deleteObject(PUBLIC_BUCKET, thumbKey);
    return fail("import_failed", 500);
  }
}
