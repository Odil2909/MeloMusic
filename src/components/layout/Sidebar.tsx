import { brandConfig } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside aria-label="Боковая панель" className="sidebar">
      <Link
        aria-label={`${brandConfig.name} — главная`}
        className="brand-lockup"
        href="/"
      >
        <span aria-hidden="true" className="brand-symbol">
          m
        </span>
        <span className="brand-name">{brandConfig.name}</span>
      </Link>

      <nav aria-label="Основная навигация" className="sidebar-nav">
        <Link aria-current="page" className="nav-item nav-item-active" href="/">
          <Icon name="home" />
          <span>Главная</span>
        </Link>
        <button
          className="nav-item nav-item-muted"
          disabled
          title="Поиск появится на следующем этапе"
          type="button"
        >
          <Icon name="search" />
          <span>Поиск</span>
          <span className="nav-soon">позже</span>
        </button>
        <button
          aria-disabled="true"
          className="nav-item nav-item-muted"
          disabled
          title="Раздел появится на следующем этапе"
          type="button"
        >
          <Icon name="library" />
          <span>Моя музыка</span>
          <span className="nav-soon">позже</span>
        </button>
      </nav>

      <div className="sidebar-divider" />
      <div className="sidebar-playlists-heading">
        <span>Подборки</span>
        <span className="nav-soon">позже</span>
      </div>
      <p className="sidebar-empty">
        Подборки провайдера здесь пока не доступны.
      </p>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <div>
          <strong>Каталог Jamendo</strong>
          <span>Воспроизведение появится позже</span>
        </div>
      </div>
    </aside>
  );
}
