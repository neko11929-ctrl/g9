import Link from "next/link";
import { getLang, getT } from "@/lib/locale";

export default function Footer() {
  const t = getT(getLang());
  const links: [string, string][] = [
    ["/legal/privacy", t("legalPrivacy")],
    ["/legal/terms", t("legalTerms")],
    ["/legal/copyright", t("legalCopyright")],
    ["/legal/contact", t("legalContact")],
  ];
  return (
    <footer className="mt-24 border-t border-white/10 py-12">
      <div className="wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[.28em] text-white">NOCTIVA</p>
          <p className="mt-2 text-sm text-silver/70">{t("slogan")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Legal">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="py-2 text-silver hover:text-white">{label}</Link>
          ))}
        </nav>
      </div>
      <p className="wrap mt-8 text-xs text-silver/50">© {new Date().getFullYear()} NOCTIVA. {t("rights")}</p>
    </footer>
  );
}
