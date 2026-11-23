"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/LangProvider";

export default function SignOut() {
  const router = useRouter();
  const t = useT();
  return (
    <button
      className="btn btn-ghost min-h-[44px] px-4 text-sm"
      onClick={async () => { await supabaseBrowser().auth.signOut(); router.push("/admin/login"); router.refresh(); }}
    >{t("signOut")}</button>
  );
}
