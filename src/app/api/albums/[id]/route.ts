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
    if (!id) throw new MusicApiError("INVALID_INPUT", "Album id is required.");
    parseAppMusicId(id, "album");
    return withMusicApi(async () => {
      const album = await getMusicProvider().getAlbum(id);
      if (!album) throw new MusicApiError("NOT_FOUND", "Album was not found in the Jamendo catalog.");
      return album;
    });
  } catch (error) {
    unstable_rethrow(error);
    return errorResponse(error);
  }
}
