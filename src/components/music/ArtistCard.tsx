import { CoverImage } from "@/components/ui/CoverImage";
import type { Artist } from "@/lib/music/types";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  if (!artist.providerUrl) return null;

  return (
    <article className="artist-card">
      <a
        aria-label={`Открыть профиль исполнителя «${artist.name}» на Jamendo`}
        className="artist-artwork"
        href={artist.providerUrl}
        rel="noreferrer"
        target="_blank"
      >
        <CoverImage
          alt={`Фото исполнителя «${artist.name}»`}
          sizes="(max-width: 767px) 44vw, (max-width: 1100px) 22vw, 16vw"
          src={artist.imageUrl}
        />
      </a>
      <div className="album-copy">
        <a className="album-title-link" href={artist.providerUrl} rel="noreferrer" target="_blank" title={artist.name}>
          {artist.name}
        </a>
        <span>Исполнитель · Jamendo</span>
      </div>
    </article>
  );
}
