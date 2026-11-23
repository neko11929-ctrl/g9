import Link from "next/link";
import LangSwitcher from "./LangSwitcher";
import { getLang, getT } from "@/lib/locale";

export default function Header() {
  const t = getT(getLang());
  const links = [
    { href: "/", label: t("navHome") },
    { href: "/explore", label: t("navExplore") },
    { href: "/favorites", label: t("navFavorites") },
  ];
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="wrap flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-[.28em] text-white" aria-label="NOCTIVA">
          NOCTIVA
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-silver transition hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <details className="relative md:hidden">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 text-white" aria-label="Menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <div className="absolute end-0 mt-2 w-56 rounded-2xl border border-white/10 bg-void p-2 shadow-glow">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-[48px] items-center rounded-xl px-4 text-silver hover:bg-plum hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
