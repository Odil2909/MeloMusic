import { MusicApiError } from "./errors";
import { MUSIC_PROVIDER } from "./types";

export type MusicEntityType = "track" | "album" | "artist";

const VALID_PROVIDER_ID = /^[1-9]\d{0,17}$/;

export function parseAppMusicId(id: string, entity: MusicEntityType): string {
  const prefix = `${MUSIC_PROVIDER}:${entity}:`;
  if (!id.startsWith(prefix)) {
    throw new MusicApiError("INVALID_INPUT", `Expected a ${prefix}<numeric-id> identifier.`);
  }
  const providerId = id.slice(prefix.length);
  if (!VALID_PROVIDER_ID.test(providerId)) {
    throw new MusicApiError("INVALID_INPUT", `Invalid ${entity} identifier.`);
  }
  return providerId;
}
