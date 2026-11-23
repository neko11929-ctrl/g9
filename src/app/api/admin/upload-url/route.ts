import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminGuard } from "@/lib/auth";
import { presignPut, PRIVATE_BUCKET, PUBLIC_BUCKET, r2Configured } from "@/lib/r2";
import { rateLimit } from "@/lib/rateLimit";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/util";

const EXT: Record<string, string> = {
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm",
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
};

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  if (!r2Configured()) return NextResponse.json({ error: "storage_not_configured" }, { status: 503 });
  if (!rateLimit("upload-url", 120, 60_000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const kind = body?.kind as "video" | "thumbnail" | "preview";
  const type = String(body?.contentType ?? "");
  const size = Number(body?.size ?? 0);
  if (!["video", "thumbnail", "preview"].includes(kind)) return NextResponse.json({ error: "bad_kind" }, { status: 400 });

  const isVideo = kind !== "thumbnail";
  if (isVideo ? !VIDEO_TYPES.includes(type) : !IMAGE_TYPES.includes(type))
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  if (!size || size > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES))
    return NextResponse.json({ error: "bad_size" }, { status: 400 });

  const id = randomUUID();
  const ext = EXT[type];
  const key = kind === "video" ? `originals/${id}.${ext}` : kind === "preview" ? `previews/${id}.${ext}` : `thumbs/${id}.${ext}`;
  const bucket = kind === "video" ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  const url = await presignPut(bucket, key, type);
  return NextResponse.json({ key, url });
}
