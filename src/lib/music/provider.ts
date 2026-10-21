import type {
  Album,
  Artist,
  SearchOptions,
  SearchResults,
  Track,
} from "./types";

export interface MusicProvider {
  search(query: string, options: SearchOptions): Promise<SearchResults>;
  getCatalogTracks(limit: number): Promise<Track[]>;
  getTracksByTag(tag: string, limit: number): Promise<Track[]>;
  getRecentAlbums(limit: number): Promise<Album[]>;
  getCatalogArtists(limit: number): Promise<Artist[]>;
  getTrack(id: string): Promise<Track | null>;
  getAlbum(id: string): Promise<Album | null>;
  getArtist(id: string): Promise<Artist | null>;
}
