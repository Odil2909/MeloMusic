import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export function MobileNav() {
  return (
    <nav aria-label="Мобильная навигация" className="mobile-nav">
      <Link aria-current="page" className="mobile-nav-item mobile-nav-active" href="/">
        <Icon name="home" size={19} />
        <span>Главная</span>
      </Link>
      <button className="mobile-nav-item mobile-nav-muted" disabled title="Поиск появится на следующем этапе" type="button">
        <Icon name="search" size={19} />
        <span>Поиск</span>
      </button>
      <button
        aria-disabled="true"
        className="mobile-nav-item mobile-nav-muted"
        disabled
        title="Раздел появится позже"
        type="button"
      >
        <Icon name="library" size={19} />
        <span>Моя музыка</span>
      </button>
    </nav>
  );
}
