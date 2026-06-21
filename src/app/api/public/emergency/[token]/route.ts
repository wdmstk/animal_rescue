import { NextResponse } from "next/server";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";
import { badRequest, notFound } from "@/lib/api-error";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const routeParams = await params;

  if (!isEmergencyToken(routeParams.token)) {
    return badRequest("Invalid token");
  }

  const payload = await getPublicEmergencyByToken(routeParams.token);

  if (!payload) {
    return notFound();
  }

  return NextResponse.json({ data: payload });
}
