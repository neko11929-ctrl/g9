"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "noctiva:favorites";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const onStorage = () => setIds(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("noctiva:fav", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("noctiva:fav", onStorage);
    };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage blocked */
    }
    setIds(next);
    window.dispatchEvent(new Event("noctiva:fav"));
  }, []);
  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
