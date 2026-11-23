import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { getLang, getT } from "@/lib/locale";

export default function Unavailable() {
  const t = getT(getLang());
  return (
    <>
      <Header />
      <main className="wrap pt-32">
        <EmptyState title={t("unavailableTitle")} body={t("unavailableBody")} href="/explore" cta={t("navExplore")} />
      </main>
      <Footer />
    </>
  );
}
