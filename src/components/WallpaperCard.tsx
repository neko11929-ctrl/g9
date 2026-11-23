import Link from "next/link";
import CardMedia from "./CardMedia";
import FavoriteButton from "./FavoriteButton";
import { catName, publicUrl, type Wallpaper } from "@/lib/util";

export default function WallpaperCard({ w, lang }: { w: Wallpaper; lang: "en" | "ar" }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-void transition hover:border-electric/60 hover:shadow-glow">
      <Link href={`/v/${w.slug}`} className="block">
        <CardMedia thumb={publicUrl(w.thumbnail_key)} preview={publicUrl(w.preview_key)} alt={w.title} />
        <div className="p-4">
          <p className="text-xs text-lavender">{catName(w.categories, lang)}</p>
          <h3 className="mt-1 truncate text-lg">{w.title}</h3>
        </div>
      </Link>
      <span className="pointer-events-none absolute start-3 top-3 flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-xs text-white backdrop-blur">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M2 1l7 4-7 4z" /></svg>
        {w.resolution ?? "MP4"}
      </span>
      <FavoriteButton id={w.id} className="absolute end-3 top-3" />
    </article>
  );
}
