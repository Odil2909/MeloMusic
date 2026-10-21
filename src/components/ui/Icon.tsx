export type IconName =
  | "arrow-right"
  | "chevron-right"
  | "clock"
  | "close"
  | "heart"
  | "home"
  | "library"
  | "menu"
  | "more"
  | "music"
  | "next"
  | "play"
  | "previous"
  | "queue"
  | "search"
  | "sparkles"
  | "user"
  | "volume";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const shared = {
    "aria-hidden": true as const,
    className: className ? `icon ${className}` : "icon",
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: size,
  };

  switch (name) {
    case "arrow-right":
      return <svg {...shared}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "chevron-right":
      return <svg {...shared}><path d="m9 18 6-6-6-6" /></svg>;
    case "clock":
      return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "close":
      return <svg {...shared}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "heart":
      return <svg {...shared}><path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
    case "home":
      return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>;
    case "library":
      return <svg {...shared}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6" /></svg>;
    case "menu":
      return <svg {...shared}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case "more":
      return <svg {...shared}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
    case "music":
      return <svg {...shared}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
    case "next":
      return <svg {...shared}><path d="M5 5v14l10-7Z" fill="currentColor" stroke="none" /><path d="M19 5v14" /></svg>;
    case "play":
      return <svg {...shared}><path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none" /></svg>;
    case "previous":
      return <svg {...shared}><path d="M19 5v14L9 12Z" fill="currentColor" stroke="none" /><path d="M5 5v14" /></svg>;
    case "queue":
      return <svg {...shared}><path d="M4 6h12M4 12h12M4 18h8M19 15v6M16 18h6" /></svg>;
    case "search":
      return <svg {...shared}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
    case "sparkles":
      return <svg {...shared}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></svg>;
    case "user":
      return <svg {...shared}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
    case "volume":
      return <svg {...shared}><path d="M4 10v4h4l5 4V6l-5 4Z" /><path d="M17 9a5 5 0 0 1 0 6M19.5 6.5a9 9 0 0 1 0 11" /></svg>;
  }
}
