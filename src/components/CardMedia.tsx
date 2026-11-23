"use client";
import { useState } from "react";

export default function CardMedia({ thumb, preview, alt }: { thumb: string | null; preview: string | null; alt: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative aspect-video overflow-hidden bg-plum"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      )}
      {hover && preview && (
        <video src={preview} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}
