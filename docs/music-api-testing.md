# Jamendo API prototype: setup and manual playback test

This is a small API check, not the music site. It uses Node.js built-in `fetch` and `http` modules; it adds no dependencies and does not download audio files. The browser harness asks Jamendo for metadata and lets the browser request a returned track stream only after the user selects the native Play control.

## Requirements

- Node.js 20 or newer.
- Network access to `api.jamendo.com` and Jamendo's image/audio hosts.
- For read-only smoke tests, Jamendo's docs publish the test-only client ID `709fa152`. For repeated development, create your own Jamendo developer application and set `JAMENDO_CLIENT_ID` locally. Never send credentials in chat. The script sends the client ID only from its server process and does not write credentials or audio URLs to disk.

Jamendo's free API terms are for non-commercial use. Do not use this harness as a public or monetized music service. Before any commercial use, get Jamendo's current written approval/quote and check the exact license shown for each recording.

## CLI metadata check

From the project directory:

```sh
node scripts/verify-music-api.mjs "lofi"
```

By default the script uses Jamendo's documented **read-test-only** ID. To use your registered app ID for a test session, set it in the shell first:

```sh
export JAMENDO_CLIENT_ID='your-client-id'
node scripts/verify-music-api.mjs "lofi"
```

The script searches tracks and, when the selected result has IDs, fetches a small album tracklist and artist record. It reports titles, artist, duration, artwork URL, tags, license URL and whether the API included an HTTPS `audio` field. It does not print or persist stream URLs. An `audio` field is only an API field-presence check; it does not establish that a track can play, is full-length, is available in Uzbekistan, or is licensed for the intended use.

An empty search is reported as `ok, but no results`. HTTP errors, Jamendo response-envelope errors (including invalid client ID and rate limit), timeouts, network failures and malformed responses are reported distinctly. The script does not deliberately send invalid credentials or create artificial API responses.

## Browser playback check

Start the local harness:

```sh
node scripts/verify-music-api.mjs --web
```

Then open <http://127.0.0.1:4173> in a desktop browser, search for a term, inspect the artist/album, duration, cover and license link, and click the browser's native Play control for one result that has a player. Wait for `Browser reports playback started` or an explicit error. Try a second result to avoid treating one successful stream as proof for the catalog. Use a direct user gesture because browsers may block autoplay. Stop the local server with Ctrl+C.

The harness uses a native `<audio controls>` element so the browser supplies play/pause, seek and volume controls where supported. It tests one selected track at a time; it does not implement a production queue. It does not store audio files or stream URLs. Search responses are marked `no-store`.

If an audio element reports a network, decode or unsupported-source error, try another track and note the title, browser/version, time and error. A failed item is not evidence that the whole catalog is unavailable; a successful item is not evidence that other items or territories work. Do not bypass a restriction, use a non-API URL, or download a stream.

## Running with a local `.env`

`.env.example` lists the two optional variables. It is a reference file; Node does not automatically load it. Copy it to `.env` if desired, keep `.env` untracked, then load it into the shell before running:

```sh
set -a
source .env
set +a
node scripts/verify-music-api.mjs "lofi"
```

For the documented sample client ID, the `JAMENDO_CLIENT_ID` variable can remain blank. `PORT` defaults to `4173`.

## Test record for this workspace

- **Environment date:** 2026-10-19.
- **Attempt made:** called Jamendo's documented read API with its test-only client ID and a search for `hello`.
- **Result:** this execution environment could not resolve `api.jamendo.com` (`curl: (6) Could not resolve host`). No Jamendo JSON response was received.
- **Local harness:** Node's attempt to bind `127.0.0.1:4173` was rejected by the managed environment (`EPERM`). Run `--web` on a normal local machine.
- **Browser playback:** not attempted, because the API host was unreachable and the sandbox disallowed starting the local server. No successful playback is claimed.
- **Next:** run the commands above on a network-enabled machine and record actual response and browser results. No API key or other secret needs to be shared with the assistant.

## Next-stage setup to prepare

Before implementing the real service, decide its business model and obtain written catalog rights that cover the intended playback, territories, and monetization. Then provide locally (not in chat) the selected provider's developer credentials, authorized redirect URL details, and any required provider account/subscription for playback tests. If Jamendo is chosen after licensing review, use a registered app ID and the agreed commercial/API plan; the public test client ID is not for production.
