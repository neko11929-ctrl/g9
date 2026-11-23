import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { getLang, getT } from "@/lib/locale";

export default function NotFound() {
  const t = getT(getLang());
  return (
    <>
      <Header />
      <main className="wrap pt-32"><EmptyState title={t("notFoundTitle")} body={t("notFoundBody")} href="/" cta={t("navHome")} /></main>
      <Footer />
    </>
  );
}
