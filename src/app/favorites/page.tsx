import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesGrid from "@/components/FavoritesGrid";
import { getLang, getT } from "@/lib/locale";

export const metadata: Metadata = { title: "Favorites", robots: { index: false } };

export default function Favorites() {
  const t = getT(getLang());
  return (
    <>
      <Header />
      <main className="wrap pt-28">
        <h1 className="text-4xl md:text-5xl">{t("navFavorites")}</h1>
        <p className="mt-3 text-silver/70">{t("favoritesNote")}</p>
        <div className="mt-10"><FavoritesGrid /></div>
      </main>
      <Footer />
    </>
  );
}
