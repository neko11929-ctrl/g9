"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, useT } from "@/components/LangProvider";
import { inspectVideo, typeOf, uploadFile } from "@/lib/uploadClient";
import { catName, formatBytes, publicUrl, QUALITY_LABELS, type Category, type Wallpaper } from "@/lib/util";
import type { Key } from "@/lib/i18n";

type Extra = { label: string; file: File | null; resolution: string };

export default function WallpaperForm({ categories, initial, siteUrl }: { categories: Category[]; initial?: Wallpaper; siteUrl: string }) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const editing = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [resolution, setResolution] = useState(initial?.resolution ?? "");
  const [frameRate, setFrameRate] = useState(initial?.frame_rate ? String(initial.frame_rate) : "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);

  const [original, setOriginal] = useState<File | null>(null);
  const [captured, setCaptured] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [customThumb, setCustomThumb] = useState<File | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  const [progress, setProgress] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ url: string; id: string; published: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  async function onOriginal(f: File | null) {
    setOriginal(f);
    if (!f) return;
    try {
      const info = await inspectVideo(f);
      if (info.width && !resolution) setResolution(`${info.width}x${info.height}`);
      if (info.frame) { setCaptured(info.frame); setCapturedUrl(URL.createObjectURL(info.frame)); }
    } catch { /* browser cannot read this codec; admin can add a thumbnail manually */ }
  }

  const thumbPreview = customThumb ? URL.createObjectURL(customThumb) : capturedUrl ?? publicUrl(initial?.thumbnail_key);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("err_title_required");
    if (!editing && !original) return setError("err_original_required");
    const thumbBlob: File | null = customThumb ?? (captured ? new File([captured], "thumb.jpg", { type: "image/jpeg" }) : null);
    if (published && !thumbBlob && !initial?.thumbnail_key) return setError("err_thumbnail_required");
    if (extras.some((x) => !x.file)) return setError("err_extra_file");

    setBusy(true);
    try {
      const prog = (k: string) => (p: number) => setProgress((s) => ({ ...s, [k]: p }));
      const needThumbUpload = !!thumbBlob && (!editing || !!customThumb || !initial?.thumbnail_key);
      const thumbnail_key = needThumbUpload ? await uploadFile("thumbnail", thumbBlob!, prog("thumb")) : undefined;
      const preview_key = preview ? await uploadFile("preview", preview, prog("preview")) : undefined;
      const files: { label: string; key: string; resolution?: string }[] = [];
      if (original) files.push({ label: "Original", key: await uploadFile("video", original, prog("original")), resolution });
      for (let i = 0; i < extras.length; i++) {
        const x = extras[i];
        files.push({ label: x.label, key: await uploadFile("video", x.file!, prog(`extra${i}`)), resolution: x.resolution });
      }
      const meta = {
        title, description, category_id: categoryId || null, resolution,
        frame_rate: frameRate ? Number(frameRate) : null, featured, published,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        ...(thumbnail_key ? { thumbnail_key } : {}),
        ...(preview_key ? { preview_key } : {}),
      };
      const res = await fetch(editing ? `/api/admin/wallpapers/${initial!.id}` : "/api/admin/wallpapers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...meta, addFiles: files, removeFileIds: removeIds } : { ...meta, files }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "save_failed");
      if (editing) { setDone({ url: `${siteUrl}/v/${initial!.slug}`, id: initial!.id, published }); router.refresh(); }
      else setDone({ url: j.url, id: j.id, published: j.published });
    } catch (err) {
      const code = (err as Error).message;
      setError(`err_${code}`);
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  }

  if (done && !editing) {
    return (
      <div className="panel space-y-5">
        <h2 className="text-2xl">{done.published ? t("publishedTitle") : t("savedDraftTitle")}</h2>
        <input readOnly value={done.url} className="field" onFocus={(e) => e.currentTarget.select()} />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => copy(done.url)} className="btn btn-primary">{copied ? t("copied") : t("copyLink")}</button>
          {done.published && <a href={done.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{t("openPage")}</a>}
          <Link href={`/admin/wallpapers/${done.id}`} className="btn btn-ghost">{t("edit")}</Link>
          <Link href="/admin/upload" onClick={() => location.reload()} className="btn btn-ghost">{t("uploadAnother")}</Link>
        </div>
      </div>
    );
  }

  const msg = error ? ((t as (k: string) => string)(error) === error ? t("err_generic") : (t as (k: string) => string)(error)) : null;
  const Bar = ({ k }: { k: string }) => progress[k] === undefined ? null : (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-plum" role="progressbar" aria-valuenow={progress[k]}><div className="h-full bg-electric transition-all" style={{ width: `${progress[k]}%` }} /></div>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="panel space-y-4">
        <label className="block"><span className="mb-1 block text-sm">{t("fTitle")}</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required /></label>
        <label className="block"><span className="mb-1 block text-sm">{t("fDescription")}</span>
          <textarea className="field min-h-[110px]" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-sm">{t("category")}</span>
            <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{catName(c, lang)}</option>)}
            </select></label>
          <label className="block"><span className="mb-1 block text-sm">{t("fTags")}</span>
            <input className="field" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="moon, night, rain" /></label>
          <label className="block"><span className="mb-1 block text-sm">{t("resolution")}</span>
            <input className="field" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="3840x2160" /></label>
          <label className="block"><span className="mb-1 block text-sm">{t("frameRate")}</span>
            <input className="field" inputMode="decimal" value={frameRate} onChange={(e) => setFrameRate(e.target.value)} placeholder="30" /></label>
        </div>
        <label className="flex min-h-[48px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#8f45ff]" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />{t("fFeatured")}</label>
      </div>

      <div className="panel space-y-5">
        <div>
          <span className="mb-1 block text-sm">{editing ? t("fReplaceOriginal") : t("fOriginal")}</span>
          <input type="file" accept="video/mp4,video/quicktime,video/webm" className="field py-3" onChange={(e) => onOriginal(e.target.files?.[0] ?? null)} />
          {original && <p className="mt-1 text-xs text-silver/60">{original.name} · {formatBytes(original.size)} · {typeOf(original)}</p>}
          <Bar k="original" />
        </div>
        <div>
          <span className="mb-1 block text-sm">{t("fThumbnail")}</span>
          {thumbPreview && /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumbPreview} alt="" className="mb-3 aspect-video w-full max-w-xs rounded-xl object-cover" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="field py-3" onChange={(e) => setCustomThumb(e.target.files?.[0] ?? null)} />
          <p className="mt-1 text-xs text-silver/60">{t("fThumbnailHint")}</p>
          <Bar k="thumb" />
        </div>
        <div>
          <span className="mb-1 block text-sm">{t("fPreview")}</span>
          <input type="file" accept="video/mp4,video/webm" className="field py-3" onChange={(e) => setPreview(e.target.files?.[0] ?? null)} />
          <p className="mt-1 text-xs text-silver/60">{t("fPreviewHint")}</p>
          <Bar k="preview" />
        </div>
      </div>

      <div className="panel space-y-4">
        <h3 className="text-xl">{t("fQualities")}</h3>
        {initial?.wallpaper_files?.filter((f) => f.label !== "Original").map((f) => (
          <label key={f.id} className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-white/10 px-4">
            <span>{f.label} <span className="text-xs text-silver/60">{formatBytes(f.file_size)}</span></span>
            <span className="flex items-center gap-2 text-sm text-red-300">
              <input type="checkbox" className="h-5 w-5 accent-red-500" checked={removeIds.includes(f.id)} onChange={(e) => setRemoveIds((s) => e.target.checked ? [...s, f.id] : s.filter((x) => x !== f.id))} />{t("remove")}
            </span>
          </label>
        ))}
        {extras.map((x, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
            <div className="flex gap-2">
              <select className="field" value={x.label} onChange={(e) => setExtras((s) => s.map((y, j) => j === i ? { ...y, label: e.target.value } : y))}>
                {QUALITY_LABELS.filter((l) => l !== "Original").map((l) => <option key={l}>{l}</option>)}
              </select>
              <button type="button" className="btn btn-ghost px-4" onClick={() => setExtras((s) => s.filter((_, j) => j !== i))} aria-label={t("remove")}>✕</button>
            </div>
            <input type="file" accept="video/mp4,video/quicktime,video/webm" className="field py-3" onChange={(e) => setExtras((s) => s.map((y, j) => j === i ? { ...y, file: e.target.files?.[0] ?? null } : y))} />
            <Bar k={`extra${i}`} />
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setExtras((s) => [...s, { label: "1080p", file: null, resolution: "" }])}>+ {t("fAddQuality")}</button>
      </div>

      <label className="flex min-h-[48px] items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#8f45ff]" checked={published} onChange={(e) => setPublished(e.target.checked)} />{t("fPublished")}</label>

      {msg && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{msg}</p>}
      {done && editing && <p role="status" className="rounded-xl border border-electric/40 bg-violet-deep/30 p-4">{t("savedChanges")}</p>}
      <button className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? t("uploading") : editing ? t("saveChanges") : published ? t("publish") : t("saveDraft")}</button>
    </form>
  );
}
