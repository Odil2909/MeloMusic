import Image from "next/image";
import Link from "next/link";
import brandMark from "../../../logo/M_logo.png";
import { brandConfig } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";
import { Suspense } from "react";
import { AccountStatus } from "@/components/layout/AccountStatus";

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-context">
        <span className="topbar-eyebrow">МУЗЫКА БЛИЖЕ</span>
        <span className="topbar-title">Твоя музыкальная витрина</span>
      </div>
      <Link aria-label={`${brandConfig.name} — главная`} className="mobile-brand" href="/">
        <span className="mobile-brand-symbol">
          <Image
            alt=""
            className="mobile-brand-image"
            height={24}
            src={brandMark}
            width={30}
          />
        </span>
        <span>{brandConfig.name}</span>
      </Link>
      <form action="/search" aria-label="Поиск по каталогу Jamendo" className="search-field" role="search">
        <Icon name="search" />
        <input
          aria-label="Поиск по трекам, альбомам и артистам"
          maxLength={100}
          name="q"
          placeholder="Что хочешь найти?"
          type="search"
        />
        <button aria-label="Найти" className="search-submit" type="submit">
          Найти
        </button>
      </form>
      <div className="topbar-actions">
        <span className="topbar-demo-label">Jamendo · независимая музыка</span>
        <Suspense fallback={<span className="account-status-placeholder">Аккаунт</span>}>
          <AccountStatus />
        </Suspense>
      </div>
    </header>
  );
}
