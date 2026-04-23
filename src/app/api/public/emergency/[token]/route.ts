import { NextResponse } from "next/server";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  if (!isEmergencyToken(params.token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const payload = await getPublicEmergencyByToken(params.token);

  if (!payload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: payload });
}
