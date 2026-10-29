import { getPrismaClient } from "@/lib/db/prisma";

export async function GET() {
  try {
    await getPrismaClient().track.count();
    return Response.json({ status: "ok", service: "neon-postgres" });
  } catch {
    return Response.json({ status: "error", service: "neon-postgres" }, { status: 503 });
  }
}
