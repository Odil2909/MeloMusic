import { Icon } from "@/components/ui/Icon";
import { CoverImage } from "@/components/ui/CoverImage";
import { brandConfig } from "@/config/brand";

export function WelcomeSection() {
  return (
    <section aria-labelledby="hero-title" className="hero-panel">
      <CoverImage
        alt=""
        className="hero-image"
        priority
        sizes="(max-width: 767px) 100vw, 80vw"
        src="/images/cover-aurora-house.png"
      />
      <div aria-hidden="true" className="hero-shade" />
      <div className="hero-content">
        <span className="hero-kicker"><Icon name="sparkles" size={15} /> МУЗЫКАЛЬНЫЙ КАТАЛОГ</span>
        <h1 id="hero-title">{brandConfig.tagline}</h1>
        <p>Открывай независимую музыку, альбомы и исполнителей из каталога Jamendo.</p>
        <a className="hero-cta" href="#home-tracks">
          Перейти к трекам
          <Icon name="arrow-right" size={17} />
        </a>
      </div>
      <span className="hero-note"><span className="status-dot" /> ДАННЫЕ JAMENDO</span>
    </section>
  );
}
