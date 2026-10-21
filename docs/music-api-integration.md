# Music API server integration

## Scope and provider

Stage 4 uses the Jamendo API v3 read API as a **non-commercial technical prototype**, as confirmed for this stage. It does not establish commercial catalog rights or approve Jamendo for a public monetized service. Check the current API terms and the license attached to each recording before using or displaying any track.

The server adapter calls the documented [tracks](https://developer.jamendo.com/v3.0/tracks), [albums](https://developer.jamendo.com/v3.0/albums), [album tracks](https://developer.jamendo.com/v3.0/albums/tracks), [artists](https://developer.jamendo.com/v3.0/artists), and [artist music info](https://developer.jamendo.com/v3.0/artists/musicinfo) methods. Read requests use the application's Jamendo `client_id`; [the documented read API uses this ID without user OAuth](https://developer.jamendo.com/v3.0/authentication). The registered client ID stays on the server in `JAMENDO_CLIENT_ID`.

## Endpoints

- `GET /api/search?q=...&type=all|tracks|albums|artists&limit=20&offset=0`
- `GET /api/tracks/jamendo:track:<id>`
- `GET /api/albums/jamendo:album:<id>`
- `GET /api/artists/jamendo:artist:<id>`

The search adapter uses Jamendo's track free-text `search` and the `namesearch` filters on its artist and album methods. Track queries explicitly request both documented track kinds (`single albumtrack`) and include license metadata. With `type=all` it makes one bounded request to each of those three methods, in parallel. App IDs include the provider and entity type, so an upstream numeric ID is never treated as a provider-independent ID.

Search defaults to 20 results per requested category, caps `limit` at 50 and `offset` at 10,000, and does not request the full catalog. `hasMore` is true when a page is full; Jamendo's `results_count` is the current page count, and the adapter leaves total result count unknown rather than requesting the more expensive `fullcount` value.

Track details normalize duration, artist/album references, artwork, provider backlink, and per-track license URL. Jamendo's track schema does not guarantee ISRC, explicit status, or territory availability, so those fields remain `null` or `unknown`. Artist tags and description are read from `artists/musicinfo` when present; tags are kept distinct from genres because the API does not classify every artist tag as a genre. Album detail uses `albums/tracks` once to return the album and its available track list.

Jamendo track responses may include an `audio` stream field. This adapter does not expose it, construct playback URLs, proxy audio, or download tracks. Playback, subscription access, and commercial rights are outside this stage.

## Caching and errors

The provider fetch uses `cache: "no-store"`, and all application API responses set `Cache-Control: no-store`. Jamendo's [published API terms](https://devportal.jamendo.com/api_terms_of_use) prohibit designing an application to cache catalog content and allow caching only when reasonably necessary for operation; no persistence or fixed metadata retention period is established for this prototype. Revisit this decision only after confirming current provider terms.

Errors use a stable `{ "error": { "code", "message" } }` JSON shape. Invalid input returns 400; missing records return 404; upstream timeout returns 504; missing configuration or provider rate limiting returns 503; provider authorization failure and malformed upstream data return 502. Internal error detail is logged without request URLs or credentials and is not sent in JSON.

## Local setup and checks

1. Register a Jamendo developer application and set its read-only client ID in a local `.env.local` as `JAMENDO_CLIENT_ID=...`.
2. Start the app with `npm run dev`.
3. Request one of the endpoints above. A missing environment variable returns `CONFIGURATION_MISSING` with HTTP 503.
4. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

The automated tests use synthetic provider envelopes strictly as unit and route fixtures. They do not prove Jamendo API availability or playback. In the implementation environment, a direct request to the documented API host failed DNS resolution, so no successful live request or actual response sample is recorded.

Stage 5 later verified live track, album, and artist metadata with the locally configured application ID on 2026-10-21. Those results and the specific home-page operations are recorded in [music-home-integration.md](music-home-integration.md). The earlier DNS failure above is the historical Stage 4 result.
