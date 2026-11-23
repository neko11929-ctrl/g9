import CategoryManager from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/data";
import { getLang, getT } from "@/lib/locale";

export default async function CategoriesPage() {
  const t = getT(getLang());
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-3xl">{t("categories")}</h1>
      <CategoryManager categories={await getCategories()} />
    </div>
  );
}
