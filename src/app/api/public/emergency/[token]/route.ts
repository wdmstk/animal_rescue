import { NextResponse } from "next/server";
import { isEmergencyToken } from "@/lib/security/emergency-token";
import { getPublicEmergencyByToken } from "@/lib/services/public-emergency-query";
import { badRequest, notFound } from "@/lib/api-error";
import { checkRateLimit, createRateLimitResponse, createRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, 'public');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const routeParams = await params;

  if (!isEmergencyToken(routeParams.token)) {
    return badRequest("Invalid token");
  }

  const payload = await getPublicEmergencyByToken(routeParams.token);

  if (!payload) {
    return notFound();
  }

  return NextResponse.json({ data: payload }, {
    headers: createRateLimitHeaders(rateLimitResult),
  });
}
