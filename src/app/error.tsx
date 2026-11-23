"use client";
import { useT } from "@/components/LangProvider";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <main className="wrap flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl">{t("errorTitle")}</h1>
      <p className="mt-3 max-w-md text-silver/80">{t("errorBody")}</p>
      <button onClick={reset} className="btn btn-primary mt-8">{t("retry")}</button>
    </main>
  );
}
