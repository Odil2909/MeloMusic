import { CoverImage } from "@/components/ui/CoverImage";
import type { Album } from "@/lib/music/types";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  if (!album.providerUrl) return null;
  const artistNames = album.artists.map((artist) => artist.name).join(", ") || "Исполнитель не указан";

  return (
    <article className="catalog-card album-card">
      <a
        aria-label={`Открыть альбом «${album.title}» исполнителя ${artistNames} на Jamendo`}
        className="catalog-card-artwork album-artwork"
        href={album.providerUrl}
        rel="noreferrer"
        target="_blank"
      >
        <CoverImage
          alt={`Обложка альбома «${album.title}»`}
          sizes="(max-width: 767px) 44vw, (max-width: 1100px) 22vw, 16vw"
          src={album.coverUrl}
        />
      </a>
      <div className="catalog-card-copy album-copy">
        <a className="catalog-card-title" href={album.providerUrl} rel="noreferrer" target="_blank" title={album.title}>
          {album.title}
        </a>
        <span title={artistNames}>{artistNames}</span>
        {album.releaseDate ? <small>Релиз · {album.releaseDate}</small> : null}
      </div>
    </article>
  );
}
