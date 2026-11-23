"use client";
import { useState } from "react";
import { useT } from "./LangProvider";
import { formatBytes } from "@/lib/util";

type F = { id: string; label: string; resolution: string | null; file_size: number };

export default function DownloadPanel({ files }: { files: F[] }) {
  const t = useT();
  const [sel, setSel] = useState(files[0]?.id);
  const [started, setStarted] = useState(false);
  if (!files.length) return <p className="text-silver/70">{t("noFiles")}</p>;
  return (
    <div>
      <p className="mb-3 text-sm text-lavender">{t("chooseQuality")}</p>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t("chooseQuality")}>
        {files.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={sel === f.id}
            onClick={() => { setSel(f.id); setStarted(false); }}
            className={`flex min-h-[56px] items-center justify-between rounded-xl border px-4 text-start transition ${sel === f.id ? "border-electric bg-violet-deep/40 text-white" : "border-white/10 text-silver hover:border-white/30"}`}
          >
            <span>{f.label === "Original" ? t("original") : f.label}{f.resolution ? <span className="ms-2 text-xs text-silver/60">{f.resolution}</span> : null}</span>
            <span className="text-xs text-silver/70">{formatBytes(f.file_size)}</span>
          </button>
        ))}
      </div>
      <a
        href={`/api/download/${sel}`}
        onClick={() => setStarted(true)}
        className="btn btn-primary mt-5 w-full sm:w-auto"
      >
        {t("download")}
      </a>
      {started && <p className="mt-3 text-sm text-lavender" role="status">{t("downloadStarting")}</p>}
    </div>
  );
}
