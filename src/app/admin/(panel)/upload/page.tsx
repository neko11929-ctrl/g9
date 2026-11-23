import WallpaperForm from "@/components/admin/WallpaperForm";
import { getCategories } from "@/lib/data";
import { getLang, getT } from "@/lib/locale";
import { siteUrl } from "@/lib/util";

export default async function UploadPage() {
  const t = getT(getLang());
  const categories = await getCategories();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl">{t("adminUpload")}</h1>
      <WallpaperForm categories={categories} siteUrl={siteUrl()} />
    </div>
  );
}
