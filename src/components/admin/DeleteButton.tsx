"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";

export default function DeleteButton({ id }: { id: string }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div>
      <button
        disabled={busy}
        className="btn btn-danger"
        onClick={async () => {
          if (!confirm(t("confirmDelete"))) return;
          setBusy(true);
          const r = await fetch(`/api/admin/wallpapers/${id}`, { method: "DELETE" });
          if (r.ok) { router.push("/admin/wallpapers"); router.refresh(); } else { setBusy(false); setErr(true); }
        }}
      >{t("delete")}</button>
      {err && <p role="alert" className="mt-2 text-sm text-red-300">{t("err_generic")}</p>}
    </div>
  );
}
