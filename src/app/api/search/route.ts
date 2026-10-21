import { getMusicProvider } from "../../../lib/music";
import { MusicApiError } from "../../../lib/music/errors";
import { errorResponse, withMusicApi } from "../../../lib/music/http";
import type { SearchOptions, SearchType } from "../../../lib/music/types";

const SEARCH_TYPES = new Set<SearchType>(["all", "tracks", "albums", "artists"]);
const MAX_QUERY_LENGTH = 100;
const MAX_LIMIT = 50;
const MAX_OFFSET = 10_000;

export function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  let options: SearchOptions & { query: string };
  try {
    options = parseSearchRequest(searchParams);
  } catch (error) {
    return Promise.resolve(errorResponse(error));
  }

  return withMusicApi(() => getMusicProvider().search(options.query, options));
}

function parseSearchRequest(params: URLSearchParams): SearchOptions & { query: string } {
  const query = params.get("q")?.trim() ?? "";
  if (!query || query.length > MAX_QUERY_LENGTH) {
    throw new MusicApiError("INVALID_INPUT", `q must contain 1-${MAX_QUERY_LENGTH} characters.`);
  }

  const typeValue = params.get("type") ?? "all";
  if (!SEARCH_TYPES.has(typeValue as SearchType)) {
    throw new MusicApiError("INVALID_INPUT", "type must be all, tracks, albums, or artists.");
  }

  const limit = parseIntegerParameter(params.get("limit"), 20, 1, MAX_LIMIT, "limit");
  const offset = parseIntegerParameter(params.get("offset"), 0, 0, MAX_OFFSET, "offset");
  return { query, type: typeValue as SearchType, limit, offset };
}

function parseIntegerParameter(
  value: string | null,
  defaultValue: number,
  minimum: number,
  maximum: number,
  name: string,
): number {
  if (value === null) return defaultValue;
  if (!/^\d+$/.test(value)) {
    throw new MusicApiError("INVALID_INPUT", `${name} must be an integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new MusicApiError("INVALID_INPUT", `${name} must be between ${minimum} and ${maximum}.`);
  }
  return parsed;
}
