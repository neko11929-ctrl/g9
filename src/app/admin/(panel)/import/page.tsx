import ImportForm from "@/components/admin/ImportForm";
import { getLang, getT } from "@/lib/locale";

export default function ImportPage() {
  const t = getT(getLang());
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-3xl">{t("adminImport")}</h1>
      <ImportForm />
    </div>
  );
}
