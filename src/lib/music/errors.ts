export type MusicErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "CONFIGURATION_MISSING"
  | "UPSTREAM_AUTH_FAILED"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_PROVIDER_RESPONSE";

const publicMessages: Record<MusicErrorCode, string> = {
  INVALID_INPUT: "Проверьте параметры запроса",
  NOT_FOUND: "Музыкальная запись не найдена",
  CONFIGURATION_MISSING: "Музыкальный сервис не настроен",
  UPSTREAM_AUTH_FAILED: "Не удалось авторизовать запрос к музыкальному сервису",
  UPSTREAM_RATE_LIMITED: "Музыкальный сервис временно ограничил запросы",
  UPSTREAM_TIMEOUT: "Музыкальный сервис не ответил вовремя",
  UPSTREAM_UNAVAILABLE: "Музыкальный сервис временно недоступен",
  INVALID_PROVIDER_RESPONSE: "Музыкальный сервис вернул неожиданный ответ",
};

export class MusicApiError extends Error {
  readonly code: MusicErrorCode;

  constructor(code: MusicErrorCode, internalMessage: string) {
    super(internalMessage);
    this.name = "MusicApiError";
    this.code = code;
  }

  get publicMessage(): string {
    return publicMessages[this.code];
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof MusicApiError) {
    const status = statusForCode(error.code);
    if (status >= 500 && error.code !== "CONFIGURATION_MISSING") {
      console.error("[music-api]", { code: error.code, message: error.message });
    }

    return Response.json(
      { error: { code: error.code, message: error.publicMessage } },
      {
        status,
        headers: {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  }

  const detail = diagnosticDetail(error);
  console.error("[music-api]", {
    code: "UPSTREAM_UNAVAILABLE",
    errorName: error instanceof Error ? error.name : typeof error,
    message: detail,
  });
  return Response.json(
    {
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: publicMessages.UPSTREAM_UNAVAILABLE,
      },
    },
    {
      status: 503,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function diagnosticDetail(error: unknown): string {
  if (!(error instanceof Error)) return "Unexpected non-error value in route handler.";
  let detail = error.message;
  const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
  if (clientId) {
    detail = detail.replaceAll(clientId, "[redacted]").replaceAll(encodeURIComponent(clientId), "[redacted]");
  }
  return detail.replace(/https?:\/\/\S+/g, "[url]").slice(0, 500);
}

function statusForCode(code: MusicErrorCode): number {
  switch (code) {
    case "INVALID_INPUT":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "UPSTREAM_TIMEOUT":
      return 504;
    case "CONFIGURATION_MISSING":
    case "UPSTREAM_RATE_LIMITED":
    case "UPSTREAM_UNAVAILABLE":
      return 503;
    case "UPSTREAM_AUTH_FAILED":
    case "INVALID_PROVIDER_RESPONSE":
      return 502;
  }
}
