"use client";
import { useState } from "react";
import { useT } from "./LangProvider";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url; document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  async function share() {
    try { await navigator.share({ title, url }); } catch { /* cancelled */ }
  }
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={copy} className="btn btn-ghost">{copied ? t("copied") : t("copyLink")}</button>
      {canShare && <button type="button" onClick={share} className="btn btn-ghost">{t("share")}</button>}
      <a className="btn btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(title + " " + url)}`}>WhatsApp</a>
      <a className="btn btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`}>Telegram</a>
      <a className="btn btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`}>X</a>
    </div>
  );
}
