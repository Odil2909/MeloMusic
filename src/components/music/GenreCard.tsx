import { TrackRow } from "@/components/music/TrackRow";
import type { GenreCollection } from "@/features/home/get-home-data";

interface GenreCardProps {
  genre: GenreCollection;
}

export function GenreCard({ genre }: GenreCardProps) {
  return (
    <article aria-labelledby={`genre-${genre.id}`} className="genre-card">
      <header className="genre-card-header">
        <h3 id={`genre-${genre.id}`}>{genre.title}</h3>
        <span>{genre.tracks.length} {trackWord(genre.tracks.length)}</span>
      </header>
      <div className="genre-track-list">
        {genre.tracks.map((track, index) => (
          <TrackRow compact index={index} key={track.id} track={track} />
        ))}
      </div>
    </article>
  );
}

function trackWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "трек";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "трека";
  return "треков";
}
