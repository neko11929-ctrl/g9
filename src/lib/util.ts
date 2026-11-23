export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "wallpaper";
}

export function formatBytes(bytes: number | string | null | undefined) {
  const n = Number(bytes ?? 0);
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_VIDEO_BYTES = 5 * 1024 ** 3; // R2 single PUT limit
export const MAX_IMAGE_BYTES = 10 * 1024 ** 2;
export const QUALITY_LABELS = ["Original", "4K", "2K", "1080p", "720p"] as const;
export type QualityLabel = (typeof QUALITY_LABELS)[number];

export type Category = { id: string; name_en: string; name_ar: string; slug: string };
export type WallpaperFile = {
  id: string;
  wallpaper_id: string;
  label: QualityLabel;
  resolution: string | null;
  file_size: number;
  storage_key?: string;
};
export type Wallpaper = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  thumbnail_key: string | null;
  preview_key: string | null;
  resolution: string | null;
  frame_rate: number | null;
  format: string;
  file_size: number;
  tags: string[];
  source_type: "upload" | "instagram";
  instagram_source_url: string | null;
  published: boolean;
  featured: boolean;
  download_count: number;
  created_at: string;
  categories?: Category | null;
  wallpaper_files?: WallpaperFile[];
};

export function publicUrl(key: string | null | undefined) {
  if (!key) return null;
  return `${(process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/${key}`;
}

export function catName(c: Category | null | undefined, lang: "en" | "ar") {
  if (!c) return "";
  return lang === "ar" ? c.name_ar : c.name_en;
}
