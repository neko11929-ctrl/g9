import Link from "next/link";

export default function EmptyState({ title, body, href, cta }: { title: string; body?: string; href?: string; cta?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="22" stroke="#8f45ff" strokeOpacity=".6" strokeWidth="2" />
        <path d="M40 20a14 14 0 1 0 4 22 11 11 0 0 1-4-22Z" fill="#8f45ff" fillOpacity=".35" />
      </svg>
      <h2 className="mt-6 text-2xl">{title}</h2>
      {body && <p className="mt-3 text-silver/80">{body}</p>}
      {href && cta && <Link href={href} className="btn btn-primary mt-8">{cta}</Link>}
    </div>
  );
}
