# Melo home catalog integration

**Stage:** 5  
**Provider:** Jamendo API v3, non-commercial technical prototype  
**Live check:** 2026-10-21

## Data shown

The home page calls the existing server-side `MusicProvider` directly. It makes five bounded, uncached requests in parallel:

- `GET /v3.0/tracks/?limit=8&include=licenses&imagesize=300` — catalog tracks, their cover and available track license URL. The page labels this as catalog content and does not imply popularity.
- `GET /v3.0/albums/?order=releasedate_desc&limit=8&imagesize=300` — releases ordered by Jamendo's returned release date. The UI omits albums without a date and displays the date when present.
- `GET /v3.0/artists/?limit=8&imagesize=300` — public artist profiles.
- `GET /v3.0/tracks/?tags=jazz&limit=3&include=licenses&imagesize=300` and the same request with `tags=classical` — actual genre-tagged tracks. Only genre categories with results are shown.

Requests use `cache: "no-store"`. The server component is streamed behind a skeleton boundary. Each section handles its own error or empty result, and its retry button refreshes the route. The client ID is read only in the server music layer.

Track, album, and artist titles link directly to the provider URL returned with that entity. Track rows show the creator, Jamendo attribution, and the returned license link when available. Remote covers are restricted to `https://usercontent.jamendo.com/`; failed or missing images use the same Melo fallback.

## Search

The `/search?q=...` page uses the existing server-side Jamendo provider to search tracks, albums, and artists. It keeps query-dependent data behind a `Suspense` boundary and shows loading, error, empty, and result states. The existing `/api/search` route is unchanged. Search results link to Jamendo when an entity has a provider URL; missing image and link metadata are handled without fabricating destinations.

## Live provider check

Using the configured local ID, read-only requests returned HTTP 200 and Jamendo `success` envelopes:

- Track metadata with `include=licenses`: 2 records, **Simple Exercice** and **Réveille le Hippie**, both by **Both**. Both returned covers, provider links, and license URLs.
- Albums ordered by `releasedate_desc`: 8 records. The first three included **Acoustic Technology** (ForestMusic), **Mes classics [Chopin]** (Airbox), and **Тихий Ноль - Пекло** (Тихий Ноль/Quiet Zero), each with release date `2026-10-21` and a cover URL.
- Artist listing: 6 records. The first names were **Both**, **Westing*House**, and **TriFace**. Some artist records did not include an image; those cards use the consistent fallback.
- Genre filters: `jazz` and `classical` each returned 3 records. `electronic`, `rock`, `ambient`, and `pop` returned successful empty results and are not shown.

The credential value and request URLs were excluded from command output and are not recorded here. Synthetic provider fixtures remain in the automated tests; live checks are separate.

## Sections not shown

- **Popularity or trending:** Jamendo's chart endpoint returned chart IDs, but the matching detail lookup did not reliably resolve a full list for this app. A direct popularity-sorted track request returned a successful empty response. The home page therefore does not call tracks “popular” or “trending.”
- **Editorial collections:** no Jamendo playlists are claimed as Melo collections. The `musicinfo` metadata request exceeded a 15-second live timeout, so the page uses the documented `tags` filter and only displays the verified Jazz and Classical categories.
- **New releases:** the page uses albums with actual provider release dates, not a fabricated “new” label derived from arbitrary track order.

## Stage boundaries and limitations

The bottom player remains visible with all playback controls disabled. User playlists, likes, accounts, and internal artist/album pages remain outside this stage. No user history, popularity numbers, recommendation claims, or local catalog cache is added.

This use is limited to the non-commercial prototype previously selected for Melo. Jamendo's published terms require attribution and direct item backlinks, prohibit designing an app to cache catalog content or provide offline access, and do not grant commercial rights. A separate review of each recording's license and suitable rights remain necessary before any use beyond this prototype.
