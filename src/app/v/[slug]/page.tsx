import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WallpaperCard from "@/components/WallpaperCard";
import DownloadPanel from "@/components/DownloadPanel";
import ShareButtons from "@/components/ShareButtons";
import FavoriteButton from "@/components/FavoriteButton";
import { getRelated, getWallpaperBySlug } from "@/lib/data";
import { getLang, getT } from "@/lib/locale";
import { presignGet, PRIVATE_BUCKET } from "@/lib/r2";
import { catName, formatBytes, publicUrl, siteUrl } from "@/lib/util";

type Props = { params: { slug: string }; searchParams: { error?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const w = await getWallpaperBySlug(params.slug);
  if (!w) return { title: "Wallpaper unavailable", robots: { index: false } };
  const desc = w.description?.slice(0, 155) || `Download ${w.title} — animated wallpaper on NOCTIVA.`;
  const img = publicUrl(w.thumbnail_key);
  return {
    title: w.title,
    description: desc,
    alternates: { canonical: `/v/${w.slug}` },
    openGraph: { title: w.title, description: desc, url: `${siteUrl()}/v/${w.slug}`, type: "video.other", images: img ? [{ url: img }] : [] },
    twitter: { card: "summary_large_image", title: w.title, description: desc, images: img ? [img] : [] },
  };
}

export default async function WallpaperPage({ params, searchParams }: Props) {
  const lang = getLang();
  const t = getT(lang);
  const w = await getWallpaperBySlug(params.slug);
  if (!w) notFound();

  const files = [...(w.wallpaper_files ?? [])].sort((a, b) => b.file_size - a.file_size);
  const smallest = [...files].sort((a, b) => a.file_size - b.file_size)[0];
  let videoSrc: string | null = publicUrl(w.preview_key);
  if (!videoSrc && smallest?.storage_key) {
    try { videoSrc = await presignGet(PRIVATE_BUCKET, smallest.storage_key, { expires: 3600 }); } catch { videoSrc = null; }
  }
  const related = await getRelated(w);
  const url = `${siteUrl()}/v/${w.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: w.title,
    description: w.description || w.title,
    thumbnailUrl: publicUrl(w.thumbnail_key),
    uploadDate: w.created_at,
    contentUrl: url,
  };
  const rows: [string, string | null][] = [
    [t("category"), catName(w.categories, lang)],
    [t("resolution"), w.resolution],
    [t("frameRate"), w.frame_rate ? `${w.frame_rate} fps` : null],
    [t("format"), w.format.toUpperCase()],
    [t("fileSize"), formatBytes(w.file_size)],
  ];

  return (
    <>
      <Header />
      <main className="wrap pt-28">
        {searchParams.error === "download" && (
          <div role="alert" className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            <strong className="block">{t("downloadFailedTitle")}</strong>{t("downloadFailedBody")}
          </div>
        )}
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glow">
              {videoSrc ? (
                <video src={videoSrc} poster={publicUrl(w.thumbnail_key) ?? undefined} controls autoPlay muted loop playsInline preload="metadata" className="aspect-video w-full bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                w.thumbnail_key && <img src={publicUrl(w.thumbnail_key)!} alt={w.title} className="aspect-video w-full object-cover" />
              )}
            </div>
            <div className="mt-8"><ShareButtons url={url} title={w.title} /></div>
          </div>
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl leading-tight">{w.title}</h1>
              <FavoriteButton id={w.id} className="shrink-0 border border-white/15" />
            </div>
            {w.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-silver/90">{w.description}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt className="text-silver/60">{k}</dt><dd className="text-white">{v}</dd></div>
              ))}
            </dl>
            <div className="panel mt-8"><DownloadPanel files={files.map(({ id, label, resolution, file_size }) => ({ id, label, resolution, file_size }))} /></div>
            <p className="mt-4 text-xs text-silver/50">{t("noAccount")}</p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-3xl">{t("related")}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => <WallpaperCard key={r.id} w={r} lang={lang} />)}
            </div>
          </section>
        )}
        <Link href="/explore" className="btn btn-ghost mt-12">{t("navExplore")}</Link>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
