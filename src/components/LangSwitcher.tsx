"use client";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";

export default function LangSwitcher() {
  const lang = useLang();
  const router = useRouter();
  const next = lang === "en" ? "ar" : "en";
  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `noctiva_lang=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="min-h-[44px] min-w-[44px] rounded-full border border-white/15 px-4 text-sm text-silver transition hover:border-electric hover:text-white"
      aria-label={next === "ar" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {next === "ar" ? "العربية" : "English"}
    </button>
  );
}
