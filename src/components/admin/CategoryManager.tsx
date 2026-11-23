"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";
import type { Category } from "@/lib/util";

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const t = useT();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name_en: "", name_ar: "" });
  const [edits, setEdits] = useState<Record<string, { name_en: string; name_ar: string; slug: string }>>({});

  async function send(url: string, method: string, body?: unknown) {
    setErr(null);
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(`err_${j.error ?? "generic"}`); return false; }
    router.refresh();
    return true;
  }
  const msg = err ? ((t as (k: string) => string)(err) === err ? t("err_generic") : (t as (k: string) => string)(err)) : null;

  return (
    <div className="space-y-6">
      {msg && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{msg}</p>}
      <form className="panel grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={async (e) => { e.preventDefault(); if (await send("/api/admin/categories", "POST", draft)) setDraft({ name_en: "", name_ar: "" }); }}>
        <input className="field" placeholder="Name (English)" value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} required />
        <input className="field" dir="rtl" placeholder="الاسم (عربي)" value={draft.name_ar} onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })} required />
        <button className="btn btn-primary">{t("add")}</button>
      </form>
      {categories.map((c) => {
        const e = edits[c.id] ?? { name_en: c.name_en, name_ar: c.name_ar, slug: c.slug };
        const set = (patch: Partial<typeof e>) => setEdits((s) => ({ ...s, [c.id]: { ...e, ...patch } }));
        return (
          <div key={c.id} className="panel grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <input className="field" value={e.name_en} onChange={(x) => set({ name_en: x.target.value })} aria-label="English name" />
            <input className="field" dir="rtl" value={e.name_ar} onChange={(x) => set({ name_ar: x.target.value })} aria-label="Arabic name" />
            <input className="field" dir="ltr" value={e.slug} onChange={(x) => set({ slug: x.target.value })} aria-label="slug" />
            <button className="btn btn-ghost" onClick={() => send(`/api/admin/categories/${c.id}`, "PATCH", e)}>{t("saveChanges")}</button>
            <button className="btn btn-danger" onClick={() => { if (confirm(t("confirmDeleteCategory"))) send(`/api/admin/categories/${c.id}`, "DELETE"); }}>{t("delete")}</button>
          </div>
        );
      })}
    </div>
  );
}
