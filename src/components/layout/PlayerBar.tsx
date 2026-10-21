import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { PlayerControls } from "@/components/player/PlayerControls";

export function PlayerBar() {
  return (
    <section aria-label="Плеер Melo. Воспроизведение пока не подключено" className="player-bar">
      <div className="player-track">
        <div aria-hidden="true" className="player-cover player-cover-placeholder">
          <Icon name="music" size={20} />
        </div>
        <div className="player-track-copy">
          <span className="player-demo-label">АУДИО ПОЗЖЕ</span>
          <strong>Воспроизведение не подключено</strong>
          <span>Треки открываются на Jamendo</span>
        </div>
        <IconButton
          className="player-favorite"
          disabled
          icon="heart"
          label="Избранное появится на следующем этапе"
        />
      </div>

      <div className="player-center">
        <PlayerControls />
        <div className="player-progress-row">
          <span>—</span>
          <div aria-label="Аудио не подключено" className="player-progress" role="img">
            <span />
          </div>
          <span>—</span>
        </div>
      </div>

      <div className="player-tools">
        <IconButton disabled icon="queue" label="Очередь появится на следующем этапе" />
        <span className="player-tools-divider" />
        <IconButton disabled icon="volume" label="Громкость появится после подключения аудио" />
        <div aria-hidden="true" className="volume-track volume-track-placeholder" />
      </div>
    </section>
  );
}
