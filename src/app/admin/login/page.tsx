"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/LangProvider";
import LangSwitcher from "@/components/LangSwitcher";

export default function Login() {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const supabase = supabaseBrowser();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err || !data.user) { setBusy(false); return setError(t("loginFailed")); }
    const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (!row) { await supabase.auth.signOut(); setBusy(false); return setError(t("notAdmin")); }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="mb-8 flex items-center justify-between">
        <span className="font-display text-2xl tracking-[.28em] text-white">NOCTIVA</span>
        <LangSwitcher />
      </div>
      <form onSubmit={submit} className="panel space-y-4">
        <h1 className="text-2xl">{t("adminLogin")}</h1>
        <input className="field" type="email" autoComplete="username" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field" type="password" autoComplete="current-password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{t("signIn")}</button>
      </form>
    </main>
  );
}
