import Link from "next/link";

export default function Section({ title, href, cta, children }: { title: string; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <section className="wrap mt-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {href && cta && <Link href={href} className="py-2 text-sm text-lavender hover:text-white">{cta}</Link>}
      </div>
      {children}
    </section>
  );
}
