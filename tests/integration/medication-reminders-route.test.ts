import { beforeEach, describe, expect, it, vi } from "vitest";

const { envMock } = vi.hoisted(() => ({
  envMock: {
    DATABASE_URL: "https://example.com/db",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    REMINDER_EMAIL_WEBHOOK_URL: "https://provider.example.com/email",
    REMINDER_LINE_WEBHOOK_URL: "https://provider.example.com/line"
  }
}));

vi.mock("@/lib/env", () => ({
  env: envMock
}));

import { POST } from "../../src/app/api/pets/[petId]/medication-reminders/route";

describe("POST /api/pets/[petId]/medication-reminders", () => {
  const petId1 = "11111111-1111-4111-8111-111111111111";
  const petId2 = "22222222-2222-4222-8222-222222222222";
  const petId3 = "33333333-3333-4333-8333-333333333333";
  const petId4 = "44444444-4444-4444-8444-444444444444";
  const petId5 = "55555555-5555-4555-8555-555555555555";
  const petId6 = "66666666-6666-4666-8666-666666666666";
  const petId7 = "77777777-7777-4777-8777-777777777777";
  const petId8 = "88888888-8888-4888-8888-888888888888";

  beforeEach(() => {
    vi.restoreAllMocks();
    envMock.REMINDER_EMAIL_WEBHOOK_URL = "https://provider.example.com/email";
    envMock.REMINDER_LINE_WEBHOOK_URL = "https://provider.example.com/line";
  });

  it("returns disabled when reminder is disabled", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "email",
          destination: "owner@example.com",
          enabled: false
        })
      }),
      { params: { petId: petId1 } }
    );

    expect(response.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();

    const payload = await response.json();
    expect(payload.data.status).toBe("disabled");
  });

  it("delivers webhook notifications to destination URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "webhook",
          destination: "https://hook.example.com/reminders",
          enabled: true
        })
      }),
      { params: { petId: petId2 } }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.status).toBe("delivered");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://hook.example.com/reminders",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("uses configured provider endpoint for email channel", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "email",
          destination: "owner@example.com",
          enabled: true
        })
      }),
      { params: { petId: petId6 } }
    );

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://provider.example.com/email",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          petId: petId6,
          channel: "email",
          destination: "owner@example.com"
        })
      })
    );
  });

  it("returns provider_not_configured when email webhook provider is missing", async () => {
    envMock.REMINDER_EMAIL_WEBHOOK_URL = undefined;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "email",
          destination: "owner@example.com",
          enabled: true
        })
      }),
      { params: { petId: petId3 } }
    );

    expect(response.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();

    const payload = await response.json();
    expect(payload.data.status).toBe("provider_not_configured");
  });

  it("returns configured_but_failed when provider responds with an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("failed", { status: 500 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "line",
          destination: "line-user-1",
          enabled: true
        })
      }),
      { params: { petId: petId4 } }
    );

    expect(response.status).toBe(502);
    const payload = await response.json();
    expect(payload.data.status).toBe("configured_but_failed");
    expect(payload.data.detail).toContain("Provider responded with status 500");
  });

  it("returns configured_but_failed when provider request throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "line",
          destination: "line-user-2",
          enabled: true
        })
      }),
      { params: { petId: petId7 } }
    );

    expect(response.status).toBe(502);
    const payload = await response.json();
    expect(payload.data.status).toBe("configured_but_failed");
    expect(payload.data.detail).toContain("network down");
  });

  it("returns 400 when webhook destination is not a URL", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "webhook",
          destination: "not-a-url",
          enabled: true
        })
      }),
      { params: { petId: petId5 } }
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when channel is invalid", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          channel: "sms",
          destination: "09000000000",
          enabled: true
        })
      }),
      { params: { petId: petId8 } }
    );

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    const payload = await response.json();
    expect(payload.error.fieldErrors.channel).toBeDefined();
  });
});
