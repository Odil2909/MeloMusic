import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { createJamendoProvider } = require("../.test-dist/src/lib/music/providers/jamendo.js");
const { loadHomeData } = require("../.test-dist/src/features/home/get-home-data.js");
const { GET: searchRoute } = require("../.test-dist/src/app/api/search/route.js");
const { GET: trackRoute } = require("../.test-dist/src/app/api/tracks/[id]/route.js");

const originalClientId = process.env.JAMENDO_CLIENT_ID;
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

test.afterEach(() => {
  if (originalClientId === undefined) delete process.env.JAMENDO_CLIENT_ID;
  else process.env.JAMENDO_CLIENT_ID = originalClientId;
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

function ok(results) {
  return Response.json({
    headers: { status: "success", code: 0, error_message: "" },
    results,
  });
}

function providerWithResponse(response) {
  return createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async () => response,
  });
}

const fullTrack = {
  id: "123",
  name: "Fixture Track",
  duration: "245",
  artist_id: "8",
  artist_name: "Sample Artist",
  album_id: "90",
  album_name: "Sample Album",
  album_image: "https://usercontent.jamendo.com/album/90.jpg",
  image: "https://usercontent.jamendo.com/track/123.jpg",
  license_ccurl: "http://creativecommons.org/licenses/by/4.0/",
  shareurl: "https://www.jamendo.com/track/123",
  audio: "https://audio.invalid/private-stream",
};

test("normalizes track metadata, namespaced ids, license and duration without returning audio URL", async () => {
  const provider = providerWithResponse(ok([fullTrack]));
  const results = await provider.search("query", { type: "tracks", limit: 10, offset: 0 });

  assert.equal(results.tracks[0].id, "jamendo:track:123");
  assert.equal(results.tracks[0].durationMs, 245_000);
  assert.equal(results.tracks[0].artists[0].id, "jamendo:artist:8");
  assert.equal(results.tracks[0].album.id, "jamendo:album:90");
  assert.equal(results.tracks[0].licenseUrl, "https://creativecommons.org/licenses/by/4.0/");
  assert.equal(results.tracks[0].availability.status, "unknown");
  assert.equal("audio" in results.tracks[0], false);
  assert.equal(JSON.stringify(results).includes("private-stream"), false);
});

test("normalizes album details and its returned track list", async () => {
  const provider = providerWithResponse(ok([{
    id: "90",
    name: "Sample Album",
    releasedate: "2020-03-04",
    artist_id: "8",
    artist_name: "Sample Artist",
    image: "https://usercontent.jamendo.com/album/90.jpg",
    shareurl: "https://www.jamendo.com/list/a90",
    tracks: [{ id: "123", name: "First Track", duration: "245", license_ccurl: "https://creativecommons.org/licenses/by/4.0/" }],
  }]));
  const album = await provider.getAlbum("jamendo:album:90");

  assert.equal(album.title, "Sample Album");
  assert.equal(album.releaseDate, "2020-03-04");
  assert.equal(album.totalTracks, 1);
  assert.equal(album.tracks[0].id, "jamendo:track:123");
  assert.equal(album.tracks[0].artists[0].name, "Sample Artist");
  assert.equal(album.tracks[0].album.id, "jamendo:album:90");
  assert.equal(album.tracks[0].coverUrl, "https://usercontent.jamendo.com/album/90.jpg");
});

test("normalizes artist tags and provider description", async () => {
  const provider = providerWithResponse(ok([{
    id: "8",
    name: "Sample Artist",
    image: "https://usercontent.jamendo.com/artist/8.jpg",
    shareurl: "https://www.jamendo.com/artist/8",
    musicinfo: {
      tags: ["electronic", "ambient"],
      description: { ru: "<p>Музыка &amp; свет</p>" },
    },
  }]));
  const artist = await provider.getArtist("jamendo:artist:8");

  assert.equal(artist.genres, null);
  assert.deepEqual(artist.tags, ["electronic", "ambient"]);
  assert.equal(artist.description, "Музыка & свет");
});

test("leaves unavailable optional metadata unknown", async () => {
  const provider = providerWithResponse(ok([{ id: "12", name: "Minimal Track" }]));
  const track = await provider.getTrack("jamendo:track:12");

  assert.equal(track.durationMs, null);
  assert.equal(track.album, null);
  assert.equal(track.coverUrl, null);
  assert.equal(track.licenseUrl, null);
  assert.equal(track.providerUrl, null);
  assert.equal(track.isrc, null);
  assert.equal(track.explicit, null);
  assert.deepEqual(track.artists, []);
});

test("empty search is a successful empty page with pagination metadata", async () => {
  const provider = providerWithResponse(ok([]));
  const result = await provider.search("no matching song", { type: "tracks", limit: 10, offset: 20 });

  assert.deepEqual(result.tracks, []);
  assert.deepEqual(result.pagination.tracks, {
    limit: 10,
    offset: 20,
    nextOffset: null,
    hasMore: false,
    total: null,
  });
  assert.equal(result.pagination.albums, null);
});

test("all-category search uses Jamendo's documented search methods and requests both track types", async () => {
  const requestedUrls = [];
  const provider = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async (input) => {
      const url = new URL(input);
      requestedUrls.push(url);
      if (url.pathname.endsWith("/tracks/")) return ok([fullTrack]);
      if (url.pathname.endsWith("/albums/")) return ok([{ id: "90", name: "Sample Album" }]);
      return ok([{ id: "8", name: "Sample Artist" }]);
    },
  });
  const result = await provider.search("query", { type: "all", limit: 5, offset: 10 });

  assert.equal(requestedUrls.length, 3);
  assert.deepEqual(requestedUrls.map((url) => url.pathname.split("/").slice(-2).join("/")), [
    "tracks/",
    "albums/",
    "artists/",
  ]);
  const tracksUrl = requestedUrls.find((url) => url.pathname.endsWith("/tracks/"));
  assert.equal(tracksUrl.searchParams.get("type"), "single albumtrack");
  assert.equal(tracksUrl.searchParams.get("include"), "licenses");
  assert.equal(result.pagination.tracks.offset, 10);
  assert.equal(result.tracks[0].title, "Fixture Track");
  assert.equal(result.albums[0].title, "Sample Album");
  assert.equal(result.artists[0].name, "Sample Artist");
});

test("home catalog operations request tracks, dated albums, and artist profiles from Jamendo", async () => {
  const requestedUrls = [];
  const provider = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async (input) => {
      const url = new URL(input);
      requestedUrls.push(url);
      if (url.pathname.endsWith("/tracks/")) return ok([fullTrack]);
      if (url.pathname.endsWith("/albums/")) {
        return ok([{
          id: "90",
          name: "Sample Album",
          releasedate: "2026-10-21",
          artist_id: "8",
          artist_name: "Sample Artist",
          image: "https://usercontent.jamendo.com/album/90.jpg",
          shareurl: "https://www.jamendo.com/list/a90",
        }]);
      }
      return ok([{
        id: "8",
        name: "Sample Artist",
        image: "https://usercontent.jamendo.com/artist/8.jpg",
        shareurl: "https://www.jamendo.com/artist/8",
      }]);
    },
  });

  const tracks = await provider.getCatalogTracks(8);
  const taggedTracks = await provider.getTracksByTag("jazz", 3);
  const albums = await provider.getRecentAlbums(8);
  const artists = await provider.getCatalogArtists(8);

  assert.equal(requestedUrls.length, 4);
  assert.equal(requestedUrls[0].pathname, "/v3.0/tracks/");
  assert.equal(requestedUrls[0].searchParams.get("include"), "licenses");
  assert.equal(requestedUrls[0].searchParams.get("imagesize"), "300");
  assert.equal(requestedUrls[0].searchParams.get("limit"), "8");
  assert.equal(requestedUrls[1].pathname, "/v3.0/tracks/");
  assert.equal(requestedUrls[1].searchParams.get("tags"), "jazz");
  assert.equal(requestedUrls[1].searchParams.get("limit"), "3");
  assert.equal(requestedUrls[2].pathname, "/v3.0/albums/");
  assert.equal(requestedUrls[2].searchParams.get("order"), "releasedate_desc");
  assert.equal(requestedUrls[3].pathname, "/v3.0/artists/");
  assert.equal(tracks[0].id, "jamendo:track:123");
  assert.equal(tracks[0].licenseUrl, "https://creativecommons.org/licenses/by/4.0/");
  assert.equal(taggedTracks[0].id, "jamendo:track:123");
  assert.equal("audio" in tracks[0], false);
  assert.equal(albums[0].releaseDate, "2026-10-21");
  assert.equal(albums[0].providerUrl, "https://www.jamendo.com/list/a90");
  assert.equal(artists[0].providerArtistId, "8");
  assert.equal(artists[0].providerUrl, "https://www.jamendo.com/artist/8");
});

test("home catalog methods reject limits outside the bounded range", async () => {
  const provider = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async () => { throw new Error("invalid limits must not reach Jamendo"); },
  });

  await assert.rejects(provider.getCatalogTracks(0), { code: "INVALID_INPUT" });
  await assert.rejects(provider.getTracksByTag("jazz & pop", 3), { code: "INVALID_INPUT" });
  await assert.rejects(provider.getRecentAlbums(51), { code: "INVALID_INPUT" });
  await assert.rejects(provider.getCatalogArtists(1.5), { code: "INVALID_INPUT" });
});

test("home data keeps successful sections when one provider request fails", async () => {
  const provider = {
    getCatalogTracks: async () => { throw new Error("private upstream detail"); },
    getTracksByTag: async (tag) => {
      if (tag === "jazz") return [{ id: "jamendo:track:44", providerUrl: "https://www.jamendo.com/track/44" }];
      throw new Error("unavailable tag request");
    },
    getRecentAlbums: async () => [{
      id: "jamendo:album:90",
      releaseDate: "2026-10-21",
      providerUrl: "https://www.jamendo.com/list/a90",
    }],
    getCatalogArtists: async () => [{
      id: "jamendo:artist:8",
      providerUrl: "https://www.jamendo.com/artist/8",
    }],
  };

  const home = await loadHomeData(provider);

  assert.deepEqual(home.tracks.items, []);
  assert.equal(home.tracks.error, "Музыкальные данные временно недоступны.");
  assert.equal(home.tracks.error.includes("private upstream detail"), false);
  assert.equal(home.albums.items.length, 1);
  assert.equal(home.artists.items.length, 1);
  assert.equal(home.genres.items[0].id, "jazz");
  assert.ok(home.genres.error);
});

test("home data omits albums without dates or provider backlinks without treating them as errors", async () => {
  const provider = {
    getCatalogTracks: async () => [{ id: "jamendo:track:12", providerUrl: null }],
    getTracksByTag: async () => [],
    getRecentAlbums: async () => [
      { id: "jamendo:album:90", releaseDate: null, providerUrl: "https://www.jamendo.com/list/a90" },
      { id: "jamendo:album:91", releaseDate: "2026-10-21", providerUrl: "https://www.jamendo.com/list/a91" },
    ],
    getCatalogArtists: async () => [{ id: "jamendo:artist:8", providerUrl: null }],
  };

  const home = await loadHomeData(provider);

  assert.equal(home.tracks.items.length, 0);
  assert.equal(home.tracks.error, null);
  assert.deepEqual(home.albums.items.map((album) => album.id), ["jamendo:album:91"]);
  assert.equal(home.artists.items.length, 0);
  assert.equal(home.artists.error, null);
});

test("detail operations return null when Jamendo has no matching entity", async () => {
  const provider = providerWithResponse(ok([]));
  assert.equal(await provider.getTrack("jamendo:track:456"), null);
});

test("translates Jamendo authentication and rate-limit errors", async () => {
  const unauthorized = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async () => new Response(null, { status: 401 }),
  });
  await assert.rejects(unauthorized.getTrack("jamendo:track:123"), { code: "UPSTREAM_AUTH_FAILED" });

  const limited = providerWithResponse(Response.json({
    headers: { status: "failed", code: 6, error_message: "rate limit" },
    results: [],
  }));
  await assert.rejects(limited.getTrack("jamendo:track:123"), { code: "UPSTREAM_RATE_LIMITED" });
});

test("translates network failure and timeout separately", async () => {
  const networkFailure = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async () => { throw new Error("network down"); },
  });
  await assert.rejects(networkFailure.getTrack("jamendo:track:123"), { code: "UPSTREAM_UNAVAILABLE" });

  const timeout = createJamendoProvider({
    clientId: "private-test-client-id",
    fetchImpl: async () => { throw Object.assign(new Error("timed out"), { name: "TimeoutError" }); },
  });
  await assert.rejects(timeout.getTrack("jamendo:track:123"), { code: "UPSTREAM_TIMEOUT" });
});

test("validates search parameters and rejects raw or malformed entity ids", async () => {
  const emptyQuery = await searchRoute(new Request("http://localhost/api/search?q=%20"));
  assert.equal(emptyQuery.status, 400);

  const invalidType = await searchRoute(new Request("http://localhost/api/search?q=music&type=playlists"));
  assert.equal(invalidType.status, 400);

  const excessiveLimit = await searchRoute(new Request("http://localhost/api/search?q=music&limit=51"));
  assert.equal(excessiveLimit.status, 400);

  const negativeOffset = await searchRoute(new Request("http://localhost/api/search?q=music&offset=-1"));
  assert.equal(negativeOffset.status, 400);

  process.env.JAMENDO_CLIENT_ID = "private-test-client-id";
  globalThis.fetch = async () => { throw new Error("invalid ids must not reach Jamendo"); };
  const invalidId = await trackRoute(new Request("http://localhost/api/tracks/123"), {
    params: Promise.resolve({ id: "123" }),
  });
  assert.equal(invalidId.status, 400);
});

test("returns 404 for missing entities and 502 for upstream authentication failure", async () => {
  process.env.JAMENDO_CLIENT_ID = "private-test-client-id";
  globalThis.fetch = async () => ok([]);
  const missing = await trackRoute(new Request("http://localhost/api/tracks/jamendo%3Atrack%3A456"), {
    params: Promise.resolve({ id: "jamendo:track:456" }),
  });
  assert.equal(missing.status, 404);

  globalThis.fetch = async () => new Response(null, { status: 401 });
  const denied = await searchRoute(new Request("http://localhost/api/search?q=music&type=tracks"));
  assert.equal(denied.status, 502);
});

test("returns 503 for missing configuration and upstream rate limits", async () => {
  delete process.env.JAMENDO_CLIENT_ID;
  const unconfigured = await searchRoute(new Request("http://localhost/api/search?q=music"));
  assert.equal(unconfigured.status, 503);

  process.env.JAMENDO_CLIENT_ID = "private-test-client-id";
  globalThis.fetch = async () => Response.json({
    headers: { status: "failed", code: 6, error_message: "rate limit" },
    results: [],
  });
  const limited = await searchRoute(new Request("http://localhost/api/search?q=music&type=tracks"));
  assert.equal(limited.status, 503);
});

test("returns 504 on timeout and does not leak credentials, provider details or stack traces", async () => {
  process.env.JAMENDO_CLIENT_ID = "super-secret-client-id";
  globalThis.fetch = async () => { throw Object.assign(new Error("TimeoutError"), { name: "TimeoutError" }); };
  console.error = () => {};

  const response = await searchRoute(new Request("http://localhost/api/search?q=music&type=tracks"));
  const body = await response.text();
  assert.equal(response.status, 504);
  assert.equal(body.includes("super-secret-client-id"), false);
  assert.equal(body.includes("api.jamendo.com"), false);
  assert.equal(body.includes("stack"), false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
