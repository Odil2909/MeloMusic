import { getMusicProvider, MusicApiError } from "../../lib/music";
import type { Album, Artist, Track } from "../../lib/music/types";
import type { MusicProvider } from "../../lib/music/provider";

const HOME_ITEM_LIMIT = 8;
const GENRE_ITEM_LIMIT = 3;
const HOME_GENRES = [
  { tag: "jazz", title: "Джаз" },
  { tag: "classical", title: "Классическая музыка" },
] as const;

export interface GenreCollection {
  id: string;
  title: string;
  tracks: Track[];
}

export interface HomeSectionData<T> {
  items: T[];
  error: string | null;
}

export interface HomeData {
  tracks: HomeSectionData<Track>;
  albums: HomeSectionData<Album>;
  artists: HomeSectionData<Artist>;
  genres: HomeSectionData<GenreCollection>;
}

export async function getHomeData(): Promise<HomeData> {
  let provider: MusicProvider;
  try {
    provider = getMusicProvider();
  } catch (error) {
    const message = publicErrorMessage(error);
    return {
      tracks: { items: [], error: message },
      albums: { items: [], error: message },
      artists: { items: [], error: message },
      genres: { items: [], error: message },
    };
  }

  return loadHomeData(provider);
}

export async function loadHomeData(provider: MusicProvider): Promise<HomeData> {
  const [tracks, albums, artists, ...genreResults] = await Promise.allSettled([
    provider.getCatalogTracks(HOME_ITEM_LIMIT),
    provider.getRecentAlbums(HOME_ITEM_LIMIT),
    provider.getCatalogArtists(HOME_ITEM_LIMIT),
    ...HOME_GENRES.map(({ tag }) => provider.getTracksByTag(tag, GENRE_ITEM_LIMIT)),
  ]);

  const genres: GenreCollection[] = [];
  const genreFailures: unknown[] = [];
  genreResults.forEach((result, index) => {
    if (result.status === "rejected") {
      genreFailures.push(result.reason);
      return;
    }

    const tracks = result.value.filter((track) => track.providerUrl);
    if (tracks.length > 0) {
      const genre = HOME_GENRES[index];
      if (genre) genres.push({ id: genre.tag, title: genre.title, tracks });
    }
  });

  return {
    tracks: sectionFromResult(tracks, (items) => items.filter((track) => track.providerUrl)),
    albums: sectionFromResult(albums, (items) =>
      items.filter((album) => album.releaseDate && album.providerUrl),
    ),
    artists: sectionFromResult(artists, (items) => items.filter((artist) => artist.providerUrl)),
    genres: {
      items: genres,
      error: genreFailures.length > 0 ? publicErrorMessage(genreFailures[0]) : null,
    },
  };
}

function sectionFromResult<T>(
  result: PromiseSettledResult<T[]>,
  select: (items: T[]) => T[],
): HomeSectionData<T> {
  if (result.status === "fulfilled") {
    return { items: select(result.value), error: null };
  }
  return { items: [], error: publicErrorMessage(result.reason) };
}

function publicErrorMessage(error: unknown): string {
  if (error instanceof MusicApiError) return error.publicMessage;
  return "Музыкальные данные временно недоступны.";
}
