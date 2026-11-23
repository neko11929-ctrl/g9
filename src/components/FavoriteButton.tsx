"use client";
import { useFavorites } from "@/lib/favorites";
import { useT } from "./LangProvider";

export default function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const t = useT();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      aria-pressed={on}
      aria-label={on ? t("removeFavorite") : t("addFavorite")}
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 backdrop-blur transition hover:bg-ink ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={on ? "#8f45ff" : "none"} stroke={on ? "#8f45ff" : "#fff"} strokeWidth="2">
        <path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9Z" />
      </svg>
    </button>
  );
}
