import { CoverImage } from "@/components/ui/CoverImage";
import { Icon } from "@/components/ui/Icon";
import type { Track } from "@/lib/music/types";

interface TrackRowProps {
  track: Track;
  index: number;
  compact?: boolean;
}

export function TrackRow({ track, index, compact = false }: TrackRowProps) {
  const artistNames = track.artists.map((artist) => artist.name).join(", ") || "Исполнитель не указан";
  const trackDetails = (
    <>
      <span className="track-artwork">
        <CoverImage
          alt={`Обложка «${track.album?.title ?? track.title}»`}
          sizes={compact ? "40px" : "44px"}
          src={track.coverUrl}
        />
      </span>
      <span className="track-copy">
        <strong>{track.title}</strong>
        <span>{artistNames}</span>
      </span>
    </>
  );
  const trackLink = (
    track.providerUrl ? (
      <a
        aria-label={`Открыть «${track.title}» и автора ${artistNames} на Jamendo`}
        className="track-main"
        href={track.providerUrl}
        rel="noreferrer"
        target="_blank"
        title={track.title}
      >
        {trackDetails}
      </a>
    ) : (
      <div aria-label={`${track.title} — ${artistNames}`} className="track-main" title={track.title}>
        {trackDetails}
      </div>
    )
  );

  if (compact) {
    return (
      <div className="track-row track-row-compact">
        <span aria-hidden="true" className="track-index">{String(index + 1).padStart(2, "0")}</span>
        {trackLink}
      </div>
    );
  }

  return (
    <div className="track-row">
      <span aria-hidden="true" className="track-index">
        {String(index + 1).padStart(2, "0")}
      </span>
      {trackLink}
      <span className="track-album" title={track.album?.title ?? "Альбом не указан"}>
        {track.album?.title ?? "—"}
      </span>
      <span className="track-duration">{formatDuration(track.durationMs)}</span>
      <span className="track-source">
        {track.providerUrl ? (
          <a href={track.providerUrl} rel="noreferrer" target="_blank">Jamendo</a>
        ) : (
          <span>Ссылка недоступна</span>
        )}
        {track.licenseUrl ? (
          <a href={track.licenseUrl} rel="noreferrer" target="_blank">Лицензия</a>
        ) : null}
      </span>
      <button
        aria-label={`Воспроизведение «${track.title}» появится позже`}
        className="track-play"
        disabled
        title="Воспроизведение появится позже"
        type="button"
      >
        <Icon name="play" size={17} />
      </button>
    </div>
  );
}

function formatDuration(durationMs: number | null): string {
  if (durationMs === null) return "—";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
