import { notFound } from "next/navigation";
import WallpaperForm from "@/components/admin/WallpaperForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getCategories } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import { getLang, getT } from "@/lib/locale";
import { siteUrl, type Wallpaper } from "@/lib/util";

export default async function EditWallpaper({ params }: { params: { id: string } }) {
  const t = getT(getLang());
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const [categories, { data }] = await Promise.all([
    getCategories(),
    supabaseServer().from("wallpapers").select("*,wallpaper_files(id,wallpaper_id,label,resolution,file_size)").eq("id", params.id).maybeSingle(),
  ]);
  if (!data) notFound();
  const w = data as unknown as Wallpaper;
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl">{t("edit")}</h1>
        <p className="mt-2 break-all text-sm text-lavender">{siteUrl()}/v/{w.slug}</p>
        {w.source_type === "instagram" && !w.published && <p className="mt-3 rounded-xl border border-electric/40 bg-violet-deep/30 p-3 text-sm">{t("reviewImport")}</p>}
      </div>
      <WallpaperForm categories={categories} initial={w} siteUrl={siteUrl()} />
      <div className="border-t border-white/10 pt-6"><DeleteButton id={w.id} /></div>
    </div>
  );
}
