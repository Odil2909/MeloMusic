import { IconButton } from "@/components/ui/IconButton";

export function PlayerControls() {
  const unavailable = "Аудио появится на следующем этапе";

  return (
    <div aria-label="Управление плеером, пока недоступно" className="player-controls">
      <IconButton disabled icon="previous" label={`Предыдущий трек. ${unavailable}`} />
      <IconButton
        className="player-play-button"
        disabled
        icon="play"
        label={`Воспроизведение не подключено. ${unavailable}`}
      />
      <IconButton disabled icon="next" label={`Следующий трек. ${unavailable}`} />
    </div>
  );
}
