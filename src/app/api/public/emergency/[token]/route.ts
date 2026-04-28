import { NextResponse } from "next/server";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const routeParams = await params;

  if (!isEmergencyToken(routeParams.token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const payload = await getPublicEmergencyByToken(routeParams.token);

  if (!payload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: payload });
}
