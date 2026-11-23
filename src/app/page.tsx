import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroScene from "@/components/HeroScene";
import Section from "@/components/Section";
import WallpaperCard from "@/components/WallpaperCard";
import EmptyState from "@/components/EmptyState";
import { getCategories, listWallpapers } from "@/lib/data";
import { getLang, getT } from "@/lib/locale";
import { catName, publicUrl } from "@/lib/util";

export default async function Home() {
  const lang = getLang();
  const t = getT(lang);
  const [featured, latest, popular, categories] = await Promise.all([
    listWallpapers({ featured: true, pageSize: 3 }),
    listWallpapers({ pageSize: 8 }),
    listWallpapers({ sort: "popular", pageSize: 4 }),
    getCategories(),
  ]);
  const hero = featured.items[0] ?? latest.items[0];

  return (
    <>
      <Header />
      <main>
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          <HeroScene />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
          <div className="wrap relative flex min-h-[100svh] flex-col justify-center gap-10 pb-16 pt-28 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h1 className="text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{t("heroTitle")}</h1>
              <p className="mt-6 max-w-md text-lg text-silver/90">{t("heroBody")}</p>
              <Link href="/explore" className="btn btn-primary mt-9">{t("exploreCta")}</Link>
            </div>
            {hero && (
              <Link href={`/v/${hero.slug}`} className="group w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-void/70 backdrop-blur transition hover:border-electric">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {hero.thumbnail_key && <img src={publicUrl(hero.thumbnail_key)!} alt={hero.title} className="aspect-video w-full object-cover" />}
                <div className="p-4">
                  <p className="text-xs text-lavender">{t("featuredPreview")}</p>
                  <p className="mt-1 font-display text-xl text-white">{hero.title}</p>
                </div>
              </Link>
            )}
          </div>
        </section>

        {latest.total === 0 ? (
          <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <>
            {featured.items.length > 0 && (
              <Section title={t("featured")} href="/explore" cta={t("viewAll")}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.items.map((w) => <WallpaperCard key={w.id} w={w} lang={lang} />)}
                </div>
              </Section>
            )}
            <Section title={t("latest")} href="/explore" cta={t("viewAll")}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {latest.items.map((w) => <WallpaperCard key={w.id} w={w} lang={lang} />)}
              </div>
            </Section>
            {popular.items.some((w) => w.download_count > 0) && (
              <Section title={t("popular")} href="/explore?sort=popular" cta={t("viewAll")}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {popular.items.map((w) => <WallpaperCard key={w.id} w={w} lang={lang} />)}
                </div>
              </Section>
            )}
          </>
        )}

        <Section title={t("categories")}>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/explore?cat=${c.slug}`} className="btn btn-ghost min-h-[52px]">{catName(c, lang)}</Link>
            ))}
          </div>
        </Section>

        <Section title={t("aboutTitle")}>
          <p className="max-w-2xl text-lg leading-relaxed text-silver/90">{t("aboutBody")}</p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
