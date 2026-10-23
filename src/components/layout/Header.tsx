import Image from "next/image";
import Link from "next/link";
import brandMark from "../../../logo/M_logo.png";
import { brandConfig } from "@/config/brand";
import { Icon } from "@/components/ui/Icon";

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-context">
        <span className="topbar-eyebrow">МУЗЫКА БЛИЖЕ</span>
        <span className="topbar-title">Твоя музыкальная витрина</span>
      </div>
      <Link aria-label={`${brandConfig.name} — главная`} className="mobile-brand" href="/">
        <span className="mobile-brand-symbol">
          <Image alt="" className="mobile-brand-image" src={brandMark} />
        </span>
        <span>{brandConfig.name}</span>
      </Link>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Поиск появится на следующем этапе"
          disabled
          placeholder="Поиск появится на следующем этапе"
          type="search"
        />
      </label>
      <div className="topbar-actions">
        <span className="topbar-demo-label">Поиск · следующий этап</span>
        <button
          aria-disabled="true"
          className="profile-button"
          disabled
          title="Профиль не подключён"
          type="button"
        >
          <span className="profile-avatar"><Icon name="user" size={17} /></span>
          <span>Профиль</span>
        </button>
      </div>
    </header>
  );
}
