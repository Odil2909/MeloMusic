import Image from "next/image";
import brandMark from "../../../logo/M_logo.png";
import { Icon } from "@/components/ui/Icon";
import { brandConfig } from "@/config/brand";

export function WelcomeSection() {
  return (
    <section aria-labelledby="hero-title" className="hero-panel">
      <div className="hero-content">
        <span className="hero-kicker"><Icon name="sparkles" size={15} /> MELO · JAMENDO</span>
        <h1 id="hero-title">{brandConfig.tagline}</h1>
        <p>Независимые треки, новые релизы и исполнители из открытого каталога.</p>
        <a className="hero-cta" href="#home-tracks">
          Исследовать каталог
          <Icon name="arrow-right" size={17} />
        </a>
      </div>
      <div aria-hidden="true" className="hero-decoration">
        <span className="hero-decoration-disc" />
        <Image alt="" className="hero-brand-image" height={112} src={brandMark} width={140} />
      </div>
    </section>
  );
}
