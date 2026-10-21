import type { Album, MoodCollection, Playlist, Track } from "./types";

// Stage 3 visual fixtures only. Production routes must not import this module.

export const demoTracks: Track[] = [
  {
    id: "glass-hours",
    title: "Стеклянные часы",
    artist: { id: "northern-lines", name: "Северные линии" },
    albumTitle: "Тихие маршруты",
    cover: "/images/cover-night-drive-v2.png",
    duration: "3:42",
  },
  {
    id: "soft-motion",
    title: "Медленное движение",
    artist: { id: "mira-vale", name: "Мира Вейл" },
    albumTitle: "Комната света",
    cover: "/images/cover-soft-motion.png",
    duration: "4:08",
  },
  {
    id: "moon-tide",
    title: "Прилив луны",
    artist: { id: "low-tide", name: "Низкий прилив" },
    albumTitle: "Там, где море",
    cover: "/images/cover-moon-tide.png",
    duration: "3:56",
  },
  {
    id: "orchid-room",
    title: "Орхидея в полночь",
    artist: { id: "green-static", name: "Зелёный шум" },
    albumTitle: "Тёплая тень",
    cover: "/images/cover-orchid-noir.png",
    duration: "3:31",
  },
  {
    id: "glass-garden",
    title: "Сад из стекла",
    artist: { id: "lena-cloud", name: "Лена Клауд" },
    albumTitle: "Светлая сторона",
    cover: "/images/cover-glass-garden.png",
    duration: "4:16",
  },
  {
    id: "aurora-house",
    title: "Дом над облаками",
    artist: { id: "north-window", name: "Северное окно" },
    albumTitle: "Вдали от шума",
    cover: "/images/cover-aurora-house.png",
    duration: "3:49",
  },
];

export const demoAlbums: Album[] = [
  {
    id: "quiet-routes",
    title: "Тихие маршруты",
    artist: { id: "northern-lines", name: "Северные линии" },
    cover: "/images/cover-night-drive-v2.png",
    releaseLabel: "Сингл · 2026",
    featuredTrackId: "glass-hours",
  },
  {
    id: "room-of-light",
    title: "Комната света",
    artist: { id: "mira-vale", name: "Мира Вейл" },
    cover: "/images/cover-soft-motion.png",
    releaseLabel: "Альбом · 2026",
    featuredTrackId: "soft-motion",
  },
  {
    id: "where-the-sea",
    title: "Там, где море",
    artist: { id: "low-tide", name: "Низкий прилив" },
    cover: "/images/cover-moon-tide.png",
    releaseLabel: "EP · 2026",
    featuredTrackId: "moon-tide",
  },
  {
    id: "warm-shadow",
    title: "Тёплая тень",
    artist: { id: "green-static", name: "Зелёный шум" },
    cover: "/images/cover-orchid-noir.png",
    releaseLabel: "Сингл · 2026",
    featuredTrackId: "orchid-room",
  },
  {
    id: "glass-garden-album",
    title: "Светлая сторона",
    artist: { id: "lena-cloud", name: "Лена Клауд" },
    cover: "/images/cover-glass-garden.png",
    releaseLabel: "Альбом · 2026",
    featuredTrackId: "glass-garden",
  },
  {
    id: "above-the-clouds",
    title: "Вдали от шума",
    artist: { id: "north-window", name: "Северное окно" },
    cover: "/images/cover-aurora-house.png",
    releaseLabel: "EP · 2026",
    featuredTrackId: "aurora-house",
  },
];

export const demoPlaylists: Playlist[] = [
  {
    id: "city-after-rain",
    title: "Город после дождя",
    description: "Свет витрин и длинная дорога домой",
    cover: "/images/cover-night-drive-v2.png",
    trackIds: ["glass-hours", "moon-tide", "aurora-house"],
    featuredTrackId: "glass-hours",
  },
  {
    id: "slow-light",
    title: "Медленный свет",
    description: "Чтобы никуда не торопиться",
    cover: "/images/cover-soft-motion.png",
    trackIds: ["soft-motion", "glass-garden", "glass-hours"],
    featuredTrackId: "soft-motion",
  },
  {
    id: "moon-side",
    title: "Обратная сторона луны",
    description: "Тихие истории до рассвета",
    cover: "/images/cover-moon-tide.png",
    trackIds: ["moon-tide", "soft-motion"],
    featuredTrackId: "moon-tide",
  },
  {
    id: "deep-green",
    title: "Глубокий зелёный",
    description: "Немного воздуха посреди города",
    cover: "/images/cover-orchid-noir.png",
    trackIds: ["orchid-room", "glass-garden", "moon-tide"],
    featuredTrackId: "orchid-room",
  },
];

export const demoMoods: MoodCollection[] = [
  {
    id: "late-night",
    title: "После полуночи",
    description: "Мягкие басы и пустые улицы",
    label: "01 / НОЧЬ",
    theme: "night",
  },
  {
    id: "slow-morning",
    title: "Спокойное утро",
    description: "Начни день без спешки",
    label: "02 / ПАУЗА",
    theme: "warm",
  },
  {
    id: "soft-motion",
    title: "В своём ритме",
    description: "Музыка для движения вперёд",
    label: "03 / ДВИЖЕНИЕ",
    theme: "motion",
  },
  {
    id: "deep-focus",
    title: "Тихий фокус",
    description: "Оставь лишнее за кадром",
    label: "04 / ФОКУС",
    theme: "focus",
  },
];
