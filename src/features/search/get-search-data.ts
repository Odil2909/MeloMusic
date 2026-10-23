import { getMusicProvider, MusicApiError } from "@/lib/music";
import type { SearchResults } from "@/lib/music/types";

export interface SearchPageData {
  query: string;
  results: SearchResults | null;
  error: string | null;
}

export async function getSearchData(query: string): Promise<SearchPageData> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return { query: "", results: null, error: null };
  }
  if (normalizedQuery.length > 100) {
    return { query: normalizedQuery, results: null, error: "Запрос должен быть короче 100 символов." };
  }

  try {
    const results = await getMusicProvider().search(normalizedQuery, {
      type: "all",
      limit: 12,
      offset: 0,
    });
    return { query: normalizedQuery, results, error: null };
  } catch (error) {
    return {
      query: normalizedQuery,
      results: null,
      error: error instanceof MusicApiError
        ? error.publicMessage
        : "Поиск по каталогу временно недоступен.",
    };
  }
}
