"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";

export default function ImportForm() {
  const t = useT();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setCode(null);
    try {
      const r = await fetch("/api/admin/import-instagram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.id) return router.push(`/admin/wallpapers/${j.id}`);
      setCode(j.code ?? "import_failed");
    } catch { setCode("network"); } finally { setBusy(false); }
  }
  const key = code ? `ig_${code}` : null;
  const msg = key ? ((t as (k: string) => string)(key) === key ? t("ig_import_failed") : (t as (k: string) => string)(key)) : null;

  return (
    <form onSubmit={submit} className="panel space-y-4">
      <p className="text-sm text-silver/80">{t("igIntro")}</p>
      <input className="field" dir="ltr" type="url" inputMode="url" placeholder="https://www.instagram.com/reel/…" value={url} onChange={(e) => setUrl(e.target.value)} required />
      {msg && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          <p>{msg}</p>
          <Link href="/admin/upload" className="btn btn-ghost mt-3">{t("manualUploadFallback")}</Link>
        </div>
      )}
      <button className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? t("importing") : t("importAction")}</button>
    </form>
  );
}
