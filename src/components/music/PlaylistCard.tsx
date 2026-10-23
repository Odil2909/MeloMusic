import { CoverImage } from "@/components/ui/CoverImage";
import { Icon } from "@/components/ui/Icon";
import type { Playlist } from "@/features/home/types";

interface PlaylistCardProps {
  playlist: Playlist;
  onSelectTrack: (trackId: string) => void;
}

export function PlaylistCard({ playlist, onSelectTrack }: PlaylistCardProps) {
  return (
    <article className="catalog-card playlist-card">
      <div className="catalog-card-artwork playlist-artwork">
        <CoverImage
          alt={`Демонстрационная обложка подборки «${playlist.title}»`}
          sizes="(max-width: 767px) 44vw, (max-width: 1100px) 22vw, 16vw"
          src={playlist.cover}
        />
        <button
          aria-label={`Выбрать демо-трек из подборки «${playlist.title}»; аудио не запустится`}
          className="cover-action"
          onClick={() => onSelectTrack(playlist.featuredTrackId)}
          title="Выбрать демо-трек — звук не запускается"
          type="button"
        >
          <Icon name="play" size={20} />
        </button>
        <span className="playlist-count">{playlist.trackIds.length} демо-трека</span>
      </div>
      <div className="catalog-card-copy playlist-copy">
        <strong className="catalog-card-title" title={playlist.title}>{playlist.title}</strong>
        <span>{playlist.description}</span>
      </div>
    </article>
  );
}
