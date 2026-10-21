#!/usr/bin/env node

import { createServer } from 'node:http';

const API_BASE = 'https://api.jamendo.com/v3.0';
const DOCUMENTED_TEST_CLIENT_ID = '709fa152';
const clientId = process.env.JAMENDO_CLIENT_ID || DOCUMENTED_TEST_CLIENT_ID;
const port = Number.parseInt(process.env.PORT || '4173', 10);
const API_TIMEOUT_MS = 15_000;

class JamendoError extends Error {
  constructor(message, { kind = 'api', status, code } = {}) {
    super(message);
    this.name = 'JamendoError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

const apiErrorNames = new Map([
  [4, 'missing required parameter'],
  [5, 'invalid client ID'],
  [6, 'rate limit exceeded'],
  [11, 'application suspended'],
  [12, 'invalid access token'],
  [13, 'insufficient permission scope'],
  [101, 'invalid access code'],
]);

function buildApiUrl(path, params = {}) {
  const url = new URL(`${API_BASE}/${path.replace(/^\/+|\/+$/g, '')}/`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('format', 'json');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function apiGet(path, params = {}) {
  let response;
  try {
    response = await fetch(buildApiUrl(path, params), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError';
    throw new JamendoError(
      timedOut
        ? `Jamendo request timed out after ${API_TIMEOUT_MS / 1000}s.`
        : `Network error while contacting Jamendo: ${error.message}`,
      { kind: timedOut ? 'timeout' : 'network' },
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new JamendoError(`Jamendo returned non-JSON data (HTTP ${response.status}).`, {
      kind: 'http',
      status: response.status,
    });
  }

  if (!response.ok) {
    const kind = response.status === 401 || response.status === 403 ? 'access-denied' : 'http';
    throw new JamendoError(
      `Jamendo returned HTTP ${response.status}${payload?.error?.message ? `: ${payload.error.message}` : ''}.`,
      { kind, status: response.status },
    );
  }

  const header = payload?.headers;
  if (header && (header.status === 'failed' || Number(header.code) !== 0)) {
    const code = Number(header.code);
    const explanation = apiErrorNames.get(code) || header.error_message || 'unknown API error';
    const kind = [5, 11, 12, 13, 101].includes(code)
      ? 'access-denied'
      : code === 6
        ? 'rate-limit'
        : 'api';
    throw new JamendoError(`Jamendo API error ${code}: ${explanation}.`, { kind, code });
  }

  if (!Array.isArray(payload?.results)) {
    throw new JamendoError('Jamendo response did not contain a results array.', { kind: 'api' });
  }
  return payload;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function licenseLink(value) {
  if (typeof value !== 'string') return null;
  const upgraded = value.replace(/^http:\/\//i, 'https://');
  return isHttpsUrl(upgraded) ? upgraded : null;
}

function summarizeTrack(track) {
  return {
    id: track.id ?? null,
    title: track.name ?? null,
    artist: track.artist_name ?? null,
    artistId: track.artist_id ?? null,
    album: track.album_name || null,
    albumId: track.album_id || null,
    durationSeconds: Number.isFinite(Number(track.duration)) ? Number(track.duration) : null,
    coverUrl: isHttpsUrl(track.album_image || track.image) ? track.album_image || track.image : null,
    genreTags: track.musicinfo?.tags?.genres ?? [],
    licenseUrl: licenseLink(track.license_ccurl),
    jamendoUrl: isHttpsUrl(track.shareurl) ? track.shareurl : null,
    streamUrlPresent: isHttpsUrl(track.audio),
    // This is only a field-presence check. The browser harness below is needed
    // to observe whether a particular track actually plays in the target browser.
  };
}

async function runChecks(query) {
  const trackPayload = await apiGet('tracks', {
    search: query,
    limit: 8,
    include: 'musicinfo',
    imagesize: 300,
    audioformat: 'mp31',
  });
  const tracks = trackPayload.results;
  if (tracks.length === 0) {
    return {
      query,
      searchStatus: 'ok, but no results',
      resultsCount: 0,
      tracks: [],
      album: null,
      artist: null,
      notes: ['No matching track was returned for this query. Try a different query.'],
    };
  }

  const candidate = tracks.find((track) => track.audio) || tracks[0];
  let album = null;
  let artist = null;

  if (candidate.album_id) {
    const albumPayload = await apiGet('albums/tracks', {
      id: candidate.album_id,
      limit: 5,
      imagesize: 300,
      audioformat: 'mp31',
    });
    const foundAlbum = albumPayload.results[0];
    if (foundAlbum) {
      album = {
        id: foundAlbum.id ?? null,
        title: foundAlbum.name ?? null,
        artist: foundAlbum.artist_name ?? null,
        trackCountReturned: Array.isArray(foundAlbum.tracks) ? foundAlbum.tracks.length : 0,
        coverUrl: isHttpsUrl(foundAlbum.image) ? foundAlbum.image : null,
        jamendoUrl: isHttpsUrl(foundAlbum.shareurl) ? foundAlbum.shareurl : null,
      };
    }
  }

  if (candidate.artist_id) {
    const artistPayload = await apiGet('artists', { id: candidate.artist_id, limit: 1 });
    const foundArtist = artistPayload.results[0];
    if (foundArtist) {
      artist = {
        id: foundArtist.id ?? null,
        name: foundArtist.name ?? null,
        imageUrl: isHttpsUrl(foundArtist.image) ? foundArtist.image : null,
        jamendoUrl: isHttpsUrl(foundArtist.shareurl) ? foundArtist.shareurl : null,
      };
    }
  }

  return {
    query,
    searchStatus: 'ok',
    resultsCount: tracks.length,
    tracks: tracks.map(summarizeTrack),
    album,
    artist,
    notes: [
      'streamUrlPresent only means the API supplied an HTTPS audio field; it does not confirm successful playback.',
      'Inspect the per-track license before any use. The API credential and any returned audio URLs are not stored by this script.',
    ],
  };
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(data, null, 2));
}

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jamendo API playback check</title>
  <style>
    :root { color-scheme: light dark; font: 16px/1.5 system-ui, sans-serif; }
    body { max-width: 850px; margin: 2rem auto; padding: 0 1rem; }
    form { display: flex; gap: .6rem; margin: 1rem 0; }
    input { flex: 1; min-width: 0; padding: .65rem; }
    button { padding: .65rem .9rem; cursor: pointer; }
    article { display: grid; grid-template-columns: 88px 1fr; gap: 1rem; border-top: 1px solid #8886; padding: 1rem 0; }
    img { width: 88px; height: 88px; object-fit: cover; background: #8882; }
    audio { display: block; width: min(100%, 520px); margin-top: .75rem; }
    .muted { opacity: .75; }
    #status { min-height: 1.5em; }
  </style>
</head>
<body>
  <h1>Jamendo API playback check</h1>
  <p class="muted">Local technical prototype only. Search results link back to Jamendo and show the per-track license. A source URL returned by the API is not proof that a track can play.</p>
  <form id="search-form">
    <input id="query" aria-label="Search tracks" value="lofi" maxlength="100">
    <button type="submit">Search</button>
  </form>
  <p id="status" role="status" aria-live="polite"></p>
  <section id="results"></section>
  <script>
    const form = document.querySelector('#search-form');
    const queryInput = document.querySelector('#query');
    const statusLine = document.querySelector('#status');
    const results = document.querySelector('#results');

    function safeLink(parent, label, href) {
      if (!href || !href.startsWith('https://')) return;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      parent.append(link);
    }

    function showTrack(track) {
      const card = document.createElement('article');
      const image = document.createElement('img');
      image.alt = '';
      if (track.coverUrl) image.src = track.coverUrl;
      card.append(image);

      const details = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = track.title || 'Untitled track';
      details.append(title, document.createElement('br'));
      details.append(document.createTextNode(track.artist || 'Unknown artist'));
      details.append(document.createElement('br'));
      details.append(document.createTextNode(
        track.durationSeconds == null ? 'Duration unavailable' : track.durationSeconds + ' sec'
      ));
      details.append(document.createElement('br'));
      if (track.album) details.append(document.createTextNode('Album: ' + track.album));
      details.append(document.createElement('br'));
      safeLink(details, 'Jamendo track page', track.jamendoUrl);
      details.append(document.createTextNode(' · Source: Jamendo'));
      if (track.licenseUrl) {
        details.append(document.createTextNode(' · '));
        safeLink(details, 'Track license', track.licenseUrl);
      }

      if (track.audioUrl) {
        const player = document.createElement('audio');
        player.controls = true;
        player.preload = 'none';
        player.src = track.audioUrl;
        player.setAttribute('aria-label', 'Play ' + (track.title || 'track'));
        player.addEventListener('play', () => {
          document.querySelectorAll('audio').forEach((other) => {
            if (other !== player) other.pause();
          });
          statusLine.textContent = 'Playback requested. Wait for the browser to report whether audio starts.';
        });
        player.addEventListener('playing', () => {
          statusLine.textContent = 'Browser reports playback started for this track.';
        });
        player.addEventListener('error', () => {
          const code = player.error?.code;
          const reasons = {
            1: 'Playback was aborted.',
            2: 'Network error while loading this stream.',
            3: 'The browser could not decode this audio.',
            4: 'The browser does not support this source or it is unavailable.'
          };
          statusLine.textContent = reasons[code] || 'Audio playback failed. Check the browser network panel and try another track.';
        });
        details.append(player);
      } else {
        const unavailable = document.createElement('p');
        unavailable.textContent = 'The API returned no HTTPS audio field for this track.';
        details.append(unavailable);
      }
      card.append(details);
      return card;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      results.replaceChildren();
      statusLine.textContent = 'Searching Jamendo…';
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(queryInput.value.trim()), { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'HTTP ' + response.status);
        if (payload.tracks.length === 0) {
          statusLine.textContent = 'Search succeeded, but returned no tracks. Try a different term.';
          return;
        }
        payload.tracks.forEach((track) => results.append(showTrack(track)));
        statusLine.textContent = 'Received ' + payload.tracks.length + ' tracks. Select a browser play control to test one.';
      } catch (error) {
        statusLine.textContent = 'Search failed: ' + error.message;
      }
    });
    form.requestSubmit();
  </script>
</body>
</html>`;

async function searchForBrowser(query) {
  const payload = await apiGet('tracks', {
    search: query,
    limit: 10,
    include: 'musicinfo',
    imagesize: 300,
    audioformat: 'mp31',
  });
  return payload.results.map((track) => ({
    ...summarizeTrack(track),
    // Passed to the <audio> element for the user's explicit playback test;
    // never persisted or printed to the terminal.
    // Only expose the stream in this non-commercial harness when the response
    // also contains the attribution target and the item's declared license.
    audioUrl: isHttpsUrl(track.audio) && isHttpsUrl(track.shareurl) && licenseLink(track.license_ccurl)
      ? track.audio
      : null,
  }));
}

async function startBrowserHarness() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-security-policy': "default-src 'self' https:; img-src 'self' https:; media-src https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
      });
      response.end(page);
      return;
    }
    if (request.method === 'GET' && url.pathname === '/api/search') {
      const query = (url.searchParams.get('q') || '').trim();
      if (!query || query.length > 100) {
        sendJson(response, 400, { error: 'Provide a search query between 1 and 100 characters.' });
        return;
      }
      try {
        const tracks = await searchForBrowser(query);
        sendJson(response, 200, { query, tracks });
      } catch (error) {
        sendJson(response, error.status || 502, { error: error.message, kind: error.kind || 'api' });
      }
      return;
    }
    sendJson(response, 404, { error: 'Not found.' });
  });

  server.on('error', (error) => {
    console.error(JSON.stringify({
      provider: 'Jamendo API v3',
      status: 'local server failed',
      errorCode: error.code || null,
      message: error.code === 'EPERM'
        ? 'This environment does not allow binding a local port. Run --web on a normal local machine.'
        : error.message,
    }, null, 2));
    process.exitCode = 1;
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Local Jamendo browser harness: http://127.0.0.1:${port}`);
    console.log(`Client ID source: ${process.env.JAMENDO_CLIENT_ID ? 'JAMENDO_CLIENT_ID environment variable' : 'Jamendo documented test-only ID'}`);
    console.log('The server keeps the client ID out of browser JavaScript. Stop with Ctrl+C.');
  });
}

const args = process.argv.slice(2);
if (args.includes('--web')) {
  await startBrowserHarness();
} else {
  const query = args.find((arg) => !arg.startsWith('--')) || 'lofi';
  try {
    const result = await runChecks(query);
    console.log(JSON.stringify({
      provider: 'Jamendo API v3',
      clientIdSource: process.env.JAMENDO_CLIENT_ID ? 'environment variable' : 'documented test-only ID',
      ...result,
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      provider: 'Jamendo API v3',
      status: 'failed',
      errorKind: error.kind || 'unknown',
      httpStatus: error.status || null,
      apiCode: error.code || null,
      message: error.message,
    }, null, 2));
    process.exitCode = 1;
  }
}
