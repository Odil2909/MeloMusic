import { NextResponse, type NextRequest } from "next/server";
import { getNeonAuth, isNeonAuthConfigured } from "@/lib/neon/auth";

export async function proxy(request: NextRequest) {
  if (!isNeonAuthConfigured()) return NextResponse.next({ request });
  return getNeonAuth().middleware({ loginUrl: "/auth/login" })(request);
}

export const config = {
  matcher: ["/account/:path*"],
};
