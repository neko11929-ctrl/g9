import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { supabaseService } from "@/lib/supabase/service";
import { presignGet, PRIVATE_BUCKET } from "@/lib/r2";
import { rateLimit } from "@/lib/rateLimit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const origin = new URL(req.url).origin;
  const fail = (slug?: string) =>
    NextResponse.redirect(slug ? `${origin}/v/${slug}?error=download` : `${origin}/v/unavailable`, 302);

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!rateLimit(`dl:${ip}`, 30, 60_000)) return new NextResponse("Too many requests", { status: 429 });
  if (!UUID.test(params.fileId)) return fail();

  try {
    const db = supabaseService();
    const { data: file } = await db
      .from("wallpaper_files")
      .select("id,label,storage_key,wallpaper_id,wallpapers!inner(id,slug,published)")
      .eq("id", params.fileId)
      .maybeSingle();
    const wp = (file as unknown as { wallpapers?: { id: string; slug: string; published: boolean } } | null)?.wallpapers;
    if (!file || !wp || !wp.published) return fail();

    const ext = file.storage_key.split(".").pop() || "mp4";
    const url = await presignGet(PRIVATE_BUCKET, file.storage_key, {
      downloadName: `${wp.slug}-${file.label}.${ext}`.replace(/[^\w.\-]/g, "_"),
      contentType: ({ mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm" } as Record<string, string>)[ext.toLowerCase()] ?? "application/octet-stream",
      expires: 300,
    });

    // Count one download per visitor + wallpaper per 10 minutes (ignores refreshes / retries).
    const ipHash = createHash("sha256").update(`${process.env.IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32);
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await db
      .from("downloads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("wallpaper_id", wp.id)
      .gte("created_at", since);
    if (!count) {
      const { error: insertError } = await db
        .from("downloads")
        .insert({ wallpaper_id: wp.id, resolution: file.label, ip_hash: ipHash });
      if (!insertError) {
        // The RPC is restricted to the service role; a failed metric update must not block the download.
        await db.rpc("increment_download", { wid: wp.id });
      }
    }

    const res = NextResponse.redirect(url, 302);
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return fail();
  }
}
