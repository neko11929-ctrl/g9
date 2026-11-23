import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { legalDoc } from "@/lib/legal";
import { getLang } from "@/lib/locale";

export function generateMetadata({ params }: { params: { doc: string } }): Metadata {
  const d = legalDoc(params.doc, "en");
  return { title: d?.title ?? "Legal", alternates: { canonical: `/legal/${params.doc}` } };
}

export default function Legal({ params }: { params: { doc: string } }) {
  const doc = legalDoc(params.doc, getLang());
  if (!doc) notFound();
  return (
    <>
      <Header />
      <main className="wrap max-w-3xl pt-28">
        <h1 className="text-4xl md:text-5xl">{doc.title}</h1>
        <div className="mt-10 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-2xl">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-silver/90">{s.p}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
