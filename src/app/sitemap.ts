import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/util";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { data } = await supabasePublic()
    .from("wallpapers")
    .select("slug,updated_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5000);
  const statics = ["", "/explore", "/legal/privacy", "/legal/terms", "/legal/copyright", "/legal/contact"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
  }));
  return [...statics, ...(data ?? []).map((w) => ({ url: `${base}/v/${w.slug}`, lastModified: w.updated_at }))];
}
