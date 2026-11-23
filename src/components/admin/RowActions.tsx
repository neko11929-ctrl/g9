"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";

export default function RowActions({ id, slug, published, siteUrl }: { id: string; slug: string; published: boolean; siteUrl: string }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState(false);

  async function call(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true); setErr(false);
    const r = await fetch(`/api/admin/wallpapers/${id}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    setBusy(false);
    if (!r.ok) return setErr(true);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn btn-ghost min-h-[44px] px-4 text-sm" onClick={async () => { await navigator.clipboard.writeText(`${siteUrl}/v/${slug}`); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
        {copied ? t("copied") : t("copyLink")}
      </button>
      <button disabled={busy} className="btn btn-ghost min-h-[44px] px-4 text-sm" onClick={() => call("PATCH", { published: !published })}>
        {published ? t("unpublish") : t("publishAction")}
      </button>
      <Link href={`/admin/wallpapers/${id}`} className="btn btn-ghost min-h-[44px] px-4 text-sm">{t("edit")}</Link>
      <button disabled={busy} className="btn btn-danger min-h-[44px] px-4 text-sm" onClick={() => { if (confirm(t("confirmDelete"))) call("DELETE"); }}>{t("delete")}</button>
      {err && <span role="alert" className="text-sm text-red-300">{t("err_generic")}</span>}
    </div>
  );
}
