export type CoverPath = `/images/${string}`;

export interface Artist {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  albumTitle: string;
  cover: CoverPath;
  duration: string;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  cover: CoverPath;
  releaseLabel: string;
  featuredTrackId: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: CoverPath;
  trackIds: string[];
  featuredTrackId: string;
}

export interface MoodCollection {
  id: string;
  title: string;
  description: string;
  label: string;
  theme: "night" | "warm" | "motion" | "focus";
}
