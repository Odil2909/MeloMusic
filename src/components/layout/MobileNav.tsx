"use client";

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Мобильная навигация" className="mobile-nav">
      <Link
        aria-current={pathname === "/" ? "page" : undefined}
        className={`mobile-nav-item${pathname === "/" ? " mobile-nav-active" : ""}`}
        href="/"
      >
        <Icon name="home" size={19} />
        <span>Главная</span>
      </Link>
      <Link
        aria-current={pathname.startsWith("/search") ? "page" : undefined}
        className={`mobile-nav-item${pathname.startsWith("/search") ? " mobile-nav-active" : ""}`}
        href="/search"
      >
        <Icon name="search" size={19} />
        <span>Поиск</span>
      </Link>
      <button
        className="mobile-nav-item mobile-nav-muted"
        disabled
        title="Личная медиатека появится после подключения аккаунтов"
        type="button"
      >
        <Icon name="library" size={19} />
        <span>Моя музыка</span>
      </button>
    </nav>
  );
}
