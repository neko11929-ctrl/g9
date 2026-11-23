import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WallpaperCard from "@/components/WallpaperCard";
import EmptyState from "@/components/EmptyState";
import { getCategories, listWallpapers } from "@/lib/data";
import { getLang, getT } from "@/lib/locale";
import { catName } from "@/lib/util";

export const metadata: Metadata = { title: "Explore", alternates: { canonical: "/explore" } };

type SP = { q?: string; cat?: string; res?: string; sort?: string; page?: string };

export default async function Explore({ searchParams }: { searchParams: SP }) {
  const lang = getLang();
  const t = getT(lang);
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const sort = searchParams.sort === "popular" ? "popular" : "new";
  const [{ items, total, pageSize }, cats] = await Promise.all([
    listWallpapers({ q: searchParams.q, cat: searchParams.cat, res: searchParams.res, sort, page }),
    getCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (p: number) => {
    const sp = new URLSearchParams();
    (["q", "cat", "res", "sort"] as const).forEach((k) => searchParams[k] && sp.set(k, searchParams[k]!));
    sp.set("page", String(p));
    return `/explore?${sp.toString()}`;
  };
  const filtered = !!(searchParams.q || searchParams.cat || searchParams.res);

  return (
    <>
      <Header />
      <main className="wrap pt-28">
        <h1 className="text-4xl md:text-5xl">{t("navExplore")}</h1>
        <form className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" action="/explore">
          <input name="q" defaultValue={searchParams.q} placeholder={t("searchPlaceholder")} className="field" aria-label={t("searchPlaceholder")} />
          <select name="cat" defaultValue={searchParams.cat ?? ""} className="field" aria-label={t("categories")}>
            <option value="">{t("allCategories")}</option>
            {cats.map((c) => <option key={c.id} value={c.slug}>{catName(c, lang)}</option>)}
          </select>
          <select name="res" defaultValue={searchParams.res ?? ""} className="field" aria-label={t("resolution")}>
            <option value="">{t("allResolutions")}</option>
            {["4K", "2K", "1080p", "720p"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select name="sort" defaultValue={sort} className="field" aria-label={t("sortBy")}>
            <option value="new">{t("sortNewest")}</option>
            <option value="popular">{t("sortPopular")}</option>
          </select>
          <button className="btn btn-primary">{t("search")}</button>
        </form>

        <div className="mt-10">
          {items.length === 0 ? (
            filtered ? (
              <EmptyState title={t("noResultsTitle")} body={t("noResultsBody")} href="/explore" cta={t("clearFilters")} />
            ) : (
              <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
            )
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((w) => <WallpaperCard key={w.id} w={w} lang={lang} />)}
            </div>
          )}
        </div>

        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
            {page > 1 && <Link href={link(page - 1)} className="btn btn-ghost">{t("prev")}</Link>}
            <span className="text-sm text-silver/70">{page} / {pages}</span>
            {page < pages && <Link href={link(page + 1)} className="btn btn-ghost">{t("next")}</Link>}
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}
