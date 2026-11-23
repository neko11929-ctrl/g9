import Link from "next/link";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { getLang, getT } from "@/lib/locale";
import LangSwitcher from "@/components/LangSwitcher";
import SignOut from "@/components/admin/SignOut";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  const t = getT(getLang());
  const nav = [
    ["/admin", t("adminDashboard")],
    ["/admin/upload", t("adminUpload")],
    ["/admin/wallpapers", t("adminWallpapers")],
    ["/admin/categories", t("categories")],
    ["/admin/import", t("adminImport")],
  ];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/90 backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <Link href="/admin" className="font-display text-xl tracking-[.25em] text-white">NOCTIVA</Link>
          <div className="flex items-center gap-2"><LangSwitcher /><SignOut /></div>
        </div>
        <nav className="wrap flex gap-1 overflow-x-auto pb-2" aria-label="Admin">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-sm text-silver hover:bg-plum hover:text-white">{label}</Link>
          ))}
        </nav>
      </header>
      <main className="wrap py-8">{children}</main>
    </div>
  );
}
