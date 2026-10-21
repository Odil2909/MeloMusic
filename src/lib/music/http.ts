import { unstable_rethrow } from "next/navigation";
import { MusicApiError, toErrorResponse } from "./errors";

export async function withMusicApi<T>(operation: () => Promise<T>): Promise<Response> {
  try {
    return Response.json(
      { data: await operation() },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch (error) {
    unstable_rethrow(error);
    return toErrorResponse(error);
  }
}

export function invalidInput(message: string): MusicApiError {
  return new MusicApiError("INVALID_INPUT", message);
}

export function errorResponse(error: unknown): Response {
  return toErrorResponse(error);
}
