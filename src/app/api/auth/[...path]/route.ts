import { getNeonAuth, isNeonAuthConfigured } from "@/lib/neon/auth";

type AuthHandlers = ReturnType<ReturnType<typeof getNeonAuth>["handler"]>;
type AuthMethod = keyof AuthHandlers;
type AuthContext = Parameters<AuthHandlers["GET"]>[1];

async function dispatchAuthRequest(method: AuthMethod, request: Request, context: AuthContext) {
  if (!isNeonAuthConfigured()) {
    return Response.json({ error: "Neon Auth is not configured." }, { status: 503 });
  }

  return getNeonAuth().handler()[method](request, context);
}

export const GET = (request: Request, context: AuthContext) => dispatchAuthRequest("GET", request, context);
export const POST = (request: Request, context: AuthContext) => dispatchAuthRequest("POST", request, context);
export const PUT = (request: Request, context: AuthContext) => dispatchAuthRequest("PUT", request, context);
export const DELETE = (request: Request, context: AuthContext) => dispatchAuthRequest("DELETE", request, context);
export const PATCH = (request: Request, context: AuthContext) => dispatchAuthRequest("PATCH", request, context);
