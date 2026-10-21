import { MusicApiError } from "../errors";
import { parseAppMusicId } from "../ids";
import type { MusicProvider } from "../provider";
import {
  MUSIC_PROVIDER,
  type Album,
  type Artist,
  type MusicAlbumSummary,
  type MusicArtistSummary,
  type SearchCollection,
  type SearchOptions,
  type SearchPagination,
  type Track,
} from "../types";

const API_BASE_URL = "https://api.jamendo.com/v3.0";
const REQUEST_TIMEOUT_MS = 10_000;

type JamendoEntity = Record<string, unknown>;
type FetchLike = typeof fetch;

interface JamendoProviderOptions {
  clientId: string;
  fetchImpl?: FetchLike;
}

export function createJamendoProvider({
  clientId,
  fetchImpl,
}: JamendoProviderOptions): MusicProvider {
  if (!clientId.trim()) {
    throw new MusicApiError(
      "CONFIGURATION_MISSING",
      "JAMENDO_CLIENT_ID is required for the Jamendo catalog API.",
    );
  }

  const request = (path: string, params: Record<string, string | number>) =>
    jamendoGet(clientId, path, params, fetchImpl ?? ((input, init) => fetch(input, init)));

  return {
    async search(query, options) {
      const selected = collectionsFor(options.type);
      const pageResults = await Promise.all(
        selected.map(async (collection) => {
          const response = await request(collection.endpoint, {
            ...collection.query(query),
            limit: options.limit,
            offset: options.offset,
            ...(collection.key === "tracks" ? { type: "single albumtrack" } : {}),
            ...(collection.key === "tracks" ? { include: "licenses" } : {}),
            ...(collection.key !== "artists" ? { imagesize: 300 } : {}),
          });
          return { key: collection.key, entities: response.results } as const;
        }),
      );

      const byKey = new Map<SearchCollection, JamendoEntity[]>(
        pageResults.map(({ key, entities }) => [key, entities]),
      );
      const tracks = (byKey.get("tracks") ?? []).map((entry) => normalizeTrack(entry));
      const albums = (byKey.get("albums") ?? []).map((entry) => normalizeAlbum(entry, false));
      const artists = (byKey.get("artists") ?? []).map(normalizeArtist);

      return {
        query,
        type: options.type,
        tracks,
        albums,
        artists,
        pagination: {
          tracks: pageInfo("tracks", byKey, options),
          albums: pageInfo("albums", byKey, options),
          artists: pageInfo("artists", byKey, options),
        },
      };
    },

    async getCatalogTracks(limit) {
      const response = await request("tracks", {
        limit: boundedCatalogLimit(limit),
        include: "licenses",
        imagesize: 300,
      });
      return response.results.map((entry) => normalizeTrack(entry));
    },

    async getTracksByTag(tag, limit) {
      const response = await request("tracks", {
        tags: boundedTag(tag),
        limit: boundedCatalogLimit(limit),
        include: "licenses",
        imagesize: 300,
      });
      return response.results.map((entry) => normalizeTrack(entry));
    },

    async getRecentAlbums(limit) {
      const response = await request("albums", {
        order: "releasedate_desc",
        limit: boundedCatalogLimit(limit),
        imagesize: 300,
      });
      return response.results.map((entry) => normalizeAlbum(entry, false));
    },

    async getCatalogArtists(limit) {
      const response = await request("artists", {
        limit: boundedCatalogLimit(limit),
        imagesize: 300,
      });
      return response.results.map(normalizeArtist);
    },

    async getTrack(id) {
      const providerId = parseAppMusicId(id, "track");
      const response = await request("tracks", {
        id: providerId,
        limit: 1,
        type: "single albumtrack",
        include: "licenses",
        imagesize: 300,
      });
      const entity = response.results[0];
      return entity ? normalizeTrack(entity) : null;
    },

    async getAlbum(id) {
      const providerId = parseAppMusicId(id, "album");
      const response = await request("albums/tracks", {
        id: providerId,
        limit: 1,
        imagesize: 300,
      });
      const entity = response.results[0];
      return entity ? normalizeAlbum(entity, true) : null;
    },

    async getArtist(id) {
      const providerId = parseAppMusicId(id, "artist");
      const response = await request("artists/musicinfo", {
        id: providerId,
        limit: 1,
      });
      const entity = response.results[0];
      return entity ? normalizeArtist(entity) : null;
    },
  };
}

function boundedCatalogLimit(limit: number): number {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new MusicApiError("INVALID_INPUT", "Catalog limit must be between 1 and 50.");
  }
  return limit;
}

function boundedTag(tag: string): string {
  if (!/^[a-z0-9_-]{1,40}$/i.test(tag)) {
    throw new MusicApiError("INVALID_INPUT", "Catalog tag must be a short alphanumeric value.");
  }
  return tag;
}

async function jamendoGet(
  clientId: string,
  path: string,
  params: Record<string, string | number>,
  fetchImpl: FetchLike,
): Promise<{ results: JamendoEntity[] }> {
  const url = new URL(`${API_BASE_URL}/${path}/`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeout(error)) {
      throw new MusicApiError("UPSTREAM_TIMEOUT", "Jamendo request timed out.");
    }
    throw new MusicApiError("UPSTREAM_UNAVAILABLE", "Could not reach the Jamendo API.");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new MusicApiError("UPSTREAM_AUTH_FAILED", `Jamendo rejected credentials (HTTP ${response.status}).`);
    }
    if (response.status === 429) {
      throw new MusicApiError("UPSTREAM_RATE_LIMITED", "Jamendo rate limit was exceeded.");
    }
    throw new MusicApiError("UPSTREAM_UNAVAILABLE", `Jamendo returned HTTP ${response.status}.`);
  }

  let decoded: unknown;
  try {
    decoded = await response.json();
  } catch {
    throw new MusicApiError(
      "INVALID_PROVIDER_RESPONSE",
      `Jamendo returned a non-JSON response with HTTP ${response.status}.`,
    );
  }

  if (!isRecord(decoded)) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", "Jamendo returned a malformed response envelope.");
  }
  const headers = isRecord(decoded.headers) ? decoded.headers : null;
  const code = Number(headers?.code);
  if (headers?.status === "failed" || (Number.isFinite(code) && code !== 0)) {
    throw errorFromJamendoCode(code);
  }

  if (
    !headers ||
    !["success", "succeed"].includes(String(headers.status)) ||
    code !== 0 ||
    !Array.isArray(decoded.results)
  ) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", "Jamendo response is missing its result envelope.");
  }

  if (!decoded.results.every(isRecord)) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", "Jamendo returned a malformed result item.");
  }

  return { results: decoded.results };
}

function errorFromJamendoCode(code: number): MusicApiError {
  if ([5, 11, 12, 13, 101].includes(code)) {
    return new MusicApiError("UPSTREAM_AUTH_FAILED", `Jamendo rejected credentials or access (code ${code}).`);
  }
  if (code === 6) {
    return new MusicApiError("UPSTREAM_RATE_LIMITED", "Jamendo rate limit was exceeded.");
  }
  if ([1, 10].includes(code)) {
    return new MusicApiError("UPSTREAM_UNAVAILABLE", `Jamendo service error (code ${code}).`);
  }
  return new MusicApiError("INVALID_PROVIDER_RESPONSE", `Jamendo rejected the API request (code ${code}).`);
}

function normalizeTrack(
  entity: JamendoEntity,
  fallbackArtist?: MusicArtistSummary,
  fallbackAlbum?: MusicAlbumSummary,
): Track {
  const providerTrackId = requiredIdentifier(entity.id, "track");
  const title = requiredString(entity.name, "track title");
  const artist = summaryArtist(entity.artist_id, entity.artist_name, entity.artist_image, entity.artist_shareurl);
  const artists = artist ? [artist] : fallbackArtist ? [fallbackArtist] : [];
  const album = summaryAlbum(entity.album_id, entity.album_name, entity.album_image, entity.album_shareurl) ?? fallbackAlbum ?? null;

  return {
    id: `${MUSIC_PROVIDER}:track:${providerTrackId}`,
    provider: MUSIC_PROVIDER,
    providerTrackId,
    title,
    durationMs: secondsToMilliseconds(entity.duration),
    artists,
    album,
    coverUrl: httpsUrl(entity.album_image) ?? httpsUrl(entity.image) ?? fallbackAlbum?.coverUrl ?? null,
    isrc: null,
    explicit: null,
    availability: { status: "unknown", territories: null },
    licenseUrl: licenseUrl(entity.license_ccurl),
    providerUrl: httpsUrl(entity.shareurl),
  };
}

function normalizeAlbum(entity: JamendoEntity, includeTracks: boolean): Album {
  const providerAlbumId = requiredIdentifier(entity.id, "album");
  const title = requiredString(entity.name, "album title");
  const artist = summaryArtist(entity.artist_id, entity.artist_name, entity.artist_image, entity.artist_shareurl);
  const artists = artist ? [artist] : [];
  const summary = summaryAlbum(entity.id, entity.name, entity.image, entity.shareurl);
  if (includeTracks && entity.tracks !== undefined && entity.tracks !== null && !Array.isArray(entity.tracks)) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", "Jamendo album track list was malformed.");
  }
  const rawTracks = includeTracks && Array.isArray(entity.tracks) ? entity.tracks : null;
  if (rawTracks && !rawTracks.every(isRecord)) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", "Jamendo album track list contained a malformed track.");
  }
  const tracks = rawTracks?.map((track) => normalizeTrack(track, artist ?? undefined, summary ?? undefined)) ?? null;
  const reportedTrackCount = nonNegativeInteger(entity.tracks_count);

  return {
    id: `${MUSIC_PROVIDER}:album:${providerAlbumId}`,
    provider: MUSIC_PROVIDER,
    providerAlbumId,
    title,
    coverUrl: summary?.coverUrl ?? null,
    artists,
    releaseDate: dateString(entity.releasedate),
    tracks,
    totalTracks: reportedTrackCount ?? tracks?.length ?? null,
    releaseType: releaseType(entity.type),
    providerUrl: summary?.providerUrl ?? null,
  };
}

function normalizeArtist(entity: JamendoEntity): Artist {
  const providerArtistId = requiredIdentifier(entity.id, "artist");
  const musicInfo = isRecord(entity.musicinfo) ? entity.musicinfo : null;
  const rawTags = musicInfo?.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0)
    : null;
  const rawDescription = isRecord(musicInfo?.description) ? musicInfo.description : null;
  const description = rawDescription ? descriptionText(localizedDescription(rawDescription)) : null;

  return {
    id: `${MUSIC_PROVIDER}:artist:${providerArtistId}`,
    provider: MUSIC_PROVIDER,
    providerArtistId,
    name: requiredString(entity.name, "artist name"),
    imageUrl: httpsUrl(entity.image),
    genres: null,
    tags,
    description,
    providerUrl: httpsUrl(entity.shareurl),
  };
}

function summaryArtist(
  rawId: unknown,
  rawName: unknown,
  rawImage: unknown,
  rawUrl: unknown,
): MusicArtistSummary | null {
  const providerArtistId = optionalIdentifier(rawId);
  const name = optionalString(rawName);
  if (!providerArtistId || !name) return null;
  return {
    id: `${MUSIC_PROVIDER}:artist:${providerArtistId}`,
    providerArtistId,
    name,
    imageUrl: httpsUrl(rawImage),
    providerUrl: httpsUrl(rawUrl),
  };
}

function summaryAlbum(
  rawId: unknown,
  rawTitle: unknown,
  rawCover: unknown,
  rawUrl: unknown,
): MusicAlbumSummary | null {
  const providerAlbumId = optionalIdentifier(rawId);
  const title = optionalString(rawTitle);
  if (!providerAlbumId || !title) return null;
  return {
    id: `${MUSIC_PROVIDER}:album:${providerAlbumId}`,
    providerAlbumId,
    title,
    coverUrl: httpsUrl(rawCover),
    providerUrl: httpsUrl(rawUrl),
  };
}

function collectionsFor(type: SearchOptions["type"]): Array<{
  key: SearchCollection;
  endpoint: string;
  query: (value: string) => Record<string, string>;
}> {
  const collections = [
    { key: "tracks" as const, endpoint: "tracks", query: (value: string) => ({ search: value }) },
    { key: "albums" as const, endpoint: "albums", query: (value: string) => ({ namesearch: value }) },
    { key: "artists" as const, endpoint: "artists", query: (value: string) => ({ namesearch: value }) },
  ];
  return type === "all" ? collections : collections.filter(({ key }) => key === type);
}

function pageInfo(
  key: SearchCollection,
  byKey: Map<SearchCollection, JamendoEntity[]>,
  options: SearchOptions,
): SearchPagination | null {
  const entities = byKey.get(key);
  if (!entities) return null;
  const hasMore = entities.length === options.limit;
  return {
    limit: options.limit,
    offset: options.offset,
    nextOffset: hasMore ? options.offset + entities.length : null,
    hasMore,
    total: null,
  };
}

function requiredIdentifier(value: unknown, field: string): string {
  const identifier = optionalIdentifier(value);
  if (!identifier) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", `Jamendo ${field} is missing a valid id.`);
  }
  return identifier;
}

function optionalIdentifier(value: unknown): string | null {
  const identifier = typeof value === "number" && Number.isSafeInteger(value)
    ? String(value)
    : typeof value === "string"
      ? value
      : "";
  return /^[1-9]\d{0,17}$/.test(identifier) ? identifier : null;
}

function requiredString(value: unknown, field: string): string {
  const result = optionalString(value);
  if (!result) {
    throw new MusicApiError("INVALID_PROVIDER_RESPONSE", `Jamendo ${field} is missing.`);
  }
  return result;
}

function optionalString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function secondsToMilliseconds(value: unknown): number | null {
  const seconds = numericValue(value);
  return seconds !== null && seconds >= 0 ? Math.round(seconds * 1000) : null;
}

function nonNegativeInteger(value: unknown): number | null {
  const number = numericValue(value);
  return number !== null && Number.isInteger(number) && number >= 0 ? number : null;
}

function numericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

function licenseUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.replace(/^http:\/\//i, "https://"));
    if (
      url.protocol !== "https:" ||
      (url.hostname !== "creativecommons.org" && !url.hostname.endsWith(".creativecommons.org"))
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function dateString(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : value;
}

function releaseType(value: unknown): Album["releaseType"] {
  return value === "album" || value === "single" ? value : null;
}

function descriptionText(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const text = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

function localizedDescription(descriptions: JamendoEntity): string | null {
  const candidates = [descriptions.ru, descriptions.en, ...Object.values(descriptions)];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? null;
}

function isRecord(value: unknown): value is JamendoEntity {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}
