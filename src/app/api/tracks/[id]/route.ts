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
    if (!id) throw new MusicApiError("INVALID_INPUT", "Track id is required.");
    parseAppMusicId(id, "track");
    return withMusicApi(async () => {
      const track = await getMusicProvider().getTrack(id);
      if (!track) throw new MusicApiError("NOT_FOUND", "Track was not found in the Jamendo catalog.");
      return track;
    });
  } catch (error) {
    unstable_rethrow(error);
    return errorResponse(error);
  }
}
