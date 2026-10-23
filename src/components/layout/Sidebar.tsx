"use client";

import { brandConfig } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import brandMark from "../../../logo/M_logo.png";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside aria-label="Боковая панель" className="sidebar">
      <Link
        aria-label={`${brandConfig.name} — главная`}
        className="brand-lockup"
        href="/"
      >
        <span aria-hidden="true" className="brand-symbol">
          <Image
            alt=""
            className="brand-logo-image"
            height={29}
            priority
            src={brandMark}
            width={36}
          />
        </span>
        <span className="brand-name">{brandConfig.name}</span>
      </Link>

      <nav aria-label="Основная навигация" className="sidebar-nav">
        <Link
          aria-current={pathname === "/" ? "page" : undefined}
          className={`nav-item${pathname === "/" ? " nav-item-active" : ""}`}
          href="/"
        >
          <Icon name="home" />
          <span>Главная</span>
        </Link>
        <Link
          aria-current={pathname.startsWith("/search") ? "page" : undefined}
          className={`nav-item${pathname.startsWith("/search") ? " nav-item-active" : ""}`}
          href="/search"
        >
          <Icon name="search" />
          <span>Поиск</span>
        </Link>
      </nav>

      <section aria-labelledby="library-title" className="library-section">
        <div className="library-header">
          <div className="library-heading">
            <Icon name="library" size={19} />
            <h2 id="library-title">Моя медиатека</h2>
          </div>
          <button
            aria-label="Создание плейлистов пока недоступно"
            className="library-add-button"
            disabled
            title="В Melo пока нет аккаунтов и личных плейлистов"
            type="button"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <div aria-label="Фильтры медиатеки недоступны" className="library-filters">
          <button disabled title="Личная медиатека пока не подключена" type="button">Плейлисты</button>
          <button disabled title="Личная медиатека пока не подключена" type="button">Артисты</button>
          <button disabled title="Личная медиатека пока не подключена" type="button">Альбомы</button>
        </div>
        <p className="library-empty">
          Личная медиатека появится после подключения аккаунтов. Сейчас доступен открытый каталог Jamendo.
        </p>
      </section>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <div>
          <strong>Открытый каталог Jamendo</strong>
          <span>Аудио в Melo не подключено</span>
        </div>
      </div>
    </aside>
  );
}
