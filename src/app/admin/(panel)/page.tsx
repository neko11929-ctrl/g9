import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getLang, getT } from "@/lib/locale";
import { r2Configured } from "@/lib/r2";
import { formatBytes, type Wallpaper } from "@/lib/util";

const FREE_TIER = 10 * 1024 ** 3; // Cloudflare R2 free tier: 10 GB-month

export default async function Dashboard() {
  const t = getT(getLang());
  const supabase = supabaseServer();
  const [{ count: total }, { count: downloads }, { data: files }, { data: recent }, { data: top }] = await Promise.all([
    supabase.from("wallpapers").select("id", { count: "exact", head: true }),
    supabase.from("downloads").select("id", { count: "exact", head: true }),
    supabase.from("wallpaper_files").select("file_size"),
    supabase.from("wallpapers").select("id,title,published,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("wallpapers").select("id,title,download_count").order("download_count", { ascending: false }).limit(5),
  ]);
  const used = (files ?? []).reduce((n, f) => n + Number(f.file_size ?? 0), 0);
  const pct = Math.min(100, (used / FREE_TIER) * 100);
  const stat = (label: string, value: string) => (
    <div className="panel"><p className="text-sm text-silver/70">{label}</p><p className="mt-2 font-display text-4xl text-white">{value}</p></div>
  );
  const flag = (ok: boolean, label: string) => (
    <li className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />{label}: {ok ? t("configured") : t("notConfigured")}</li>
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(t("totalWallpapers"), String(total ?? 0))}
        {stat(t("totalDownloads"), String(downloads ?? 0))}
        {stat(t("storageUsed"), formatBytes(used))}
      </div>
      <div className="panel">
        <p className="text-sm text-silver/70">{t("storageStatus")}</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-plum"><div className="h-full bg-electric" style={{ width: `${pct}%` }} /></div>
        <p className="mt-2 text-xs text-silver/60">{formatBytes(used)} / {formatBytes(FREE_TIER)}</p>
        <ul className="mt-4 space-y-1 text-sm">
          {flag(r2Configured(), "Cloudflare R2")}
          {flag(!!process.env.SUPABASE_SERVICE_ROLE_KEY, "Supabase service role")}
          {flag(!!process.env.INSTAGRAM_ACCESS_TOKEN, "Instagram API")}
        </ul>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel">
          <h2 className="mb-3 text-xl">{t("recentUploads")}</h2>
          <ul className="divide-y divide-white/5">
            {((recent as Pick<Wallpaper, "id" | "title" | "published">[]) ?? []).map((w) => (
              <li key={w.id}><Link className="flex min-h-[48px] items-center justify-between hover:text-white" href={`/admin/wallpapers/${w.id}`}><span className="truncate">{w.title}</span><span className="ms-3 shrink-0 text-xs text-silver/60">{w.published ? t("statusPublished") : t("statusDraft")}</span></Link></li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2 className="mb-3 text-xl">{t("mostDownloaded")}</h2>
          <ul className="divide-y divide-white/5">
            {((top as Pick<Wallpaper, "id" | "title" | "download_count">[]) ?? []).map((w) => (
              <li key={w.id}><Link className="flex min-h-[48px] items-center justify-between hover:text-white" href={`/admin/wallpapers/${w.id}`}><span className="truncate">{w.title}</span><span className="ms-3 shrink-0 text-sm text-lavender">{w.download_count}</span></Link></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
