import { MusicApiError } from "./errors";
import type { MusicProvider } from "./provider";
import { createJamendoProvider } from "./providers/jamendo";

export type { MusicProvider } from "./provider";
export { MusicApiError } from "./errors";
export { parseAppMusicId } from "./ids";
export * from "./types";

let configuredClientId: string | null = null;
let configuredProvider: MusicProvider | null = null;

export function getMusicProvider(): MusicProvider {
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (!clientId) {
    throw new MusicApiError(
      "CONFIGURATION_MISSING",
      "Set JAMENDO_CLIENT_ID to a registered Jamendo application id.",
    );
  }

  if (!configuredProvider || configuredClientId !== clientId) {
    configuredClientId = clientId;
    configuredProvider = createJamendoProvider({ clientId });
  }
  return configuredProvider;
}
