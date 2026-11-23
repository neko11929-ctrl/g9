import { supabaseServer } from "@/lib/supabase/server";
import { getLang, getT } from "@/lib/locale";
import RowActions from "@/components/admin/RowActions";
import { formatBytes, publicUrl, siteUrl, type Wallpaper } from "@/lib/util";

export default async function ManageWallpapers({ searchParams }: { searchParams: { q?: string } }) {
  const t = getT(getLang());
  const q = (searchParams.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
  let query = supabaseServer().from("wallpapers").select("id,title,slug,published,thumbnail_key,file_size,download_count,source_type").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query;
  const items = (data as Wallpaper[]) ?? [];
  return (
    <div>
      <h1 className="mb-6 text-3xl">{t("adminWallpapers")}</h1>
      <form className="mb-6 flex gap-3"><input name="q" defaultValue={q} className="field" placeholder={t("searchPlaceholder")} /><button className="btn btn-primary">{t("search")}</button></form>
      {items.length === 0 && <p className="text-silver/70">{t("emptyTitle")}</p>}
      <div className="space-y-3">
        {items.map((w) => (
          <div key={w.id} className="panel flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {w.thumbnail_key ? <img src={publicUrl(w.thumbnail_key)!} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" /> : <div className="h-16 w-28 shrink-0 rounded-lg bg-plum" />}
              <div className="min-w-0">
                <p className="truncate text-white">{w.title}</p>
                <p className="text-xs text-silver/60">{w.published ? t("statusPublished") : t("statusDraft")} · {formatBytes(w.file_size)} · {w.download_count} {t("downloadsWord")}{w.source_type === "instagram" ? " · Instagram" : ""}</p>
              </div>
            </div>
            <RowActions id={w.id} slug={w.slug} published={w.published} siteUrl={siteUrl()} />
          </div>
        ))}
      </div>
    </div>
  );
}
