import { unstable_rethrow } from "next/navigation";
import { getMusicProvider } from "../../../../lib/music";
import { MusicApiError } from "../../../../lib/music/errors";
import { errorResponse, withMusicApi } from "../../../../lib/music/http";
import { parseAppMusicId } from "../../../../lib/music/ids";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const { id } = await context.params;
    if (!id) throw new MusicApiError("INVALID_INPUT", "Artist id is required.");
    parseAppMusicId(id, "artist");
    return withMusicApi(async () => {
      const artist = await getMusicProvider().getArtist(id);
      if (!artist) throw new MusicApiError("NOT_FOUND", "Artist was not found in the Jamendo catalog.");
      return artist;
    });
  } catch (error) {
    unstable_rethrow(error);
    return errorResponse(error);
  }
}
