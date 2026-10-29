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
      <Link
        aria-current={pathname.startsWith("/account") || pathname.startsWith("/auth") ? "page" : undefined}
        className={`mobile-nav-item${pathname.startsWith("/account") || pathname.startsWith("/auth") ? " mobile-nav-active" : ""}`}
        href="/account"
      >
        <Icon name="user" size={19} />
        <span>Аккаунт</span>
      </Link>
    </nav>
  );
}
