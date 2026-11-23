import "server-only";
import { headObject, PRIVATE_BUCKET, PUBLIC_BUCKET } from "@/lib/r2";
import { QUALITY_LABELS } from "@/lib/util";

export type FileInput = { label: (typeof QUALITY_LABELS)[number]; key: string; resolution?: string | null };

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates and normalises metadata fields shared by create + update. */
export function cleanMeta(b: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if ("title" in b) out.title = s(b.title, 120);
  if ("description" in b) out.description = s(b.description, 2000) || null;
  if ("category_id" in b) out.category_id = typeof b.category_id === "string" && b.category_id ? b.category_id : null;
  if ("resolution" in b) out.resolution = s(b.resolution, 20) || null;
  if ("frame_rate" in b) {
    const f = Number(b.frame_rate);
    out.frame_rate = Number.isFinite(f) && f > 0 && f <= 240 ? f : null;
  }
  if ("featured" in b) out.featured = b.featured === true;
  if ("tags" in b && Array.isArray(b.tags)) out.tags = b.tags.map((t) => s(t, 30)).filter(Boolean).slice(0, 15);
  return out;
}

export function cleanFiles(raw: unknown): FileInput[] | null {
  if (!Array.isArray(raw)) return [];
  const out: FileInput[] = [];
  for (const f of raw) {
    if (!f || !QUALITY_LABELS.includes(f.label) || typeof f.key !== "string" || !f.key.startsWith("originals/") || f.key.includes("..")) return null;
    out.push({ label: f.label, key: f.key, resolution: s(f.resolution, 20) || null });
  }
  return out;
}

export async function verifyFile(key: string) {
  const h = await headObject(PRIVATE_BUCKET, key);
  return h && h.size > 0 ? h.size : null;
}

export async function verifyThumb(key: unknown) {
  if (typeof key !== "string" || !key.startsWith("thumbs/") || key.includes("..")) return false;
  return !!(await headObject(PUBLIC_BUCKET, key));
}

export async function verifyPreview(key: unknown) {
  if (typeof key !== "string" || !key.startsWith("previews/") || key.includes("..")) return false;
  return !!(await headObject(PUBLIC_BUCKET, key));
}
