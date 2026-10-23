import { CoverImage } from "@/components/ui/CoverImage";
import type { Artist } from "@/lib/music/types";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const image = (
    <CoverImage
      alt={`Фото исполнителя «${artist.name}»`}
      fallbackLabel={artistInitials(artist.name)}
      sizes="(max-width: 767px) 44vw, (max-width: 1100px) 22vw, 16vw"
      src={artist.imageUrl}
    />
  );

  return (
    <article className="catalog-card artist-card">
      {artist.providerUrl ? (
        <a
          aria-label={`Открыть профиль исполнителя «${artist.name}» на Jamendo`}
          className="catalog-card-artwork artist-artwork"
          href={artist.providerUrl}
          rel="noreferrer"
          target="_blank"
        >
          {image}
        </a>
      ) : (
        <div className="catalog-card-artwork artist-artwork">{image}</div>
      )}
      <div className="catalog-card-copy artist-copy">
        {artist.providerUrl ? (
          <a className="catalog-card-title" href={artist.providerUrl} rel="noreferrer" target="_blank" title={artist.name}>
            {artist.name}
          </a>
        ) : (
          <strong className="catalog-card-title" title={artist.name}>{artist.name}</strong>
        )}
        <span>Исполнитель</span>
      </div>
    </article>
  );
}

function artistInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase("ru-RU");
}
