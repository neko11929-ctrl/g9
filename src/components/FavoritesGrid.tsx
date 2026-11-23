"use client";
import { useEffect, useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { useLang, useT } from "./LangProvider";
import WallpaperCard from "./WallpaperCard";
import EmptyState from "./EmptyState";
import type { Wallpaper } from "@/lib/util";

export default function FavoritesGrid() {
  const { ids } = useFavorites();
  const lang = useLang();
  const t = useT();
  const [items, setItems] = useState<Wallpaper[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ids.length) { setItems([]); return; }
    fetch(`/api/wallpapers?ids=${ids.join(",")}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setItems(d.items); setFailed(false); })
      .catch(() => setFailed(true));
  }, [ids]);

  if (failed) return <EmptyState title={t("networkTitle")} body={t("networkBody")} />;
  if (items === null) return <p className="py-20 text-center text-silver/60">…</p>;
  if (!items.length) return <EmptyState title={t("noFavoritesTitle")} body={t("noFavoritesBody")} href="/explore" cta={t("navExplore")} />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((w) => <WallpaperCard key={w.id} w={w} lang={lang} />)}
    </div>
  );
}
