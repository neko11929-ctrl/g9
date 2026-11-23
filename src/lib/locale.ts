import "server-only";
import { cookies } from "next/headers";
import { dict, translate, type Lang, type Key } from "@/lib/i18n";

export function getLang(): Lang {
  return cookies().get("noctiva_lang")?.value === "ar" ? "ar" : "en";
}

export function getT(lang: Lang) {
  return (key: Key) => translate(lang, key);
}
export { dict };
