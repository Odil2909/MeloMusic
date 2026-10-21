"use client";

import { useRouter } from "next/navigation";

export function RetryCatalogButton() {
  const router = useRouter();

  return (
    <button className="catalog-retry-button" onClick={() => router.refresh()} type="button">
      Повторить запрос
    </button>
  );
}
