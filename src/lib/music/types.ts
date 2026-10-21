export const MUSIC_PROVIDER = "jamendo" as const;

export type MusicProviderId = typeof MUSIC_PROVIDER;
export type SearchType = "all" | "tracks" | "albums" | "artists";
export type SearchCollection = Exclude<SearchType, "all">;

export interface SearchOptions {
  type: SearchType;
  limit: number;
  offset: number;
}

export interface MusicArtistSummary {
  id: string;
  providerArtistId: string;
  name: string;
  imageUrl: string | null;
  providerUrl: string | null;
}

export interface MusicAlbumSummary {
  id: string;
  providerAlbumId: string;
  title: string;
  coverUrl: string | null;
  providerUrl: string | null;
}

export interface Track {
  id: string;
  provider: MusicProviderId;
  providerTrackId: string;
  title: string;
  durationMs: number | null;
  artists: MusicArtistSummary[];
  album: MusicAlbumSummary | null;
  coverUrl: string | null;
  isrc: string | null;
  explicit: boolean | null;
  availability: {
    status: "unknown";
    territories: null;
  };
  licenseUrl: string | null;
  providerUrl: string | null;
}

export interface Artist {
  id: string;
  provider: MusicProviderId;
  providerArtistId: string;
  name: string;
  imageUrl: string | null;
  genres: string[] | null;
  tags: string[] | null;
  description: string | null;
  providerUrl: string | null;
}

export interface Album {
  id: string;
  provider: MusicProviderId;
  providerAlbumId: string;
  title: string;
  coverUrl: string | null;
  artists: MusicArtistSummary[];
  releaseDate: string | null;
  tracks: Track[] | null;
  totalTracks: number | null;
  releaseType: "album" | "single" | null;
  providerUrl: string | null;
}

export interface SearchPagination {
  limit: number;
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
  total: number | null;
}

export interface SearchResults {
  query: string;
  type: SearchType;
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  pagination: Record<SearchCollection, SearchPagination | null>;
}
