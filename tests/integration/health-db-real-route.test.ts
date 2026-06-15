import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const shouldRunDbIntegration = process.env.RUN_DB_INTEGRATION === "1" && Boolean(process.env.DATABASE_URL);
const describeDb = shouldRunDbIntegration ? describe : describe.skip;

describeDb("health routes (real database)", () => {
  const householdId = randomUUID();
  const petId = randomUUID();
  const authenticatedUserId = "22222222-2222-4222-8222-222222222222";
  let prisma: (typeof import("@/lib/prisma"))["prisma"];
  let postCoreMetrics: (typeof import("../../src/app/api/pets/[petId]/health/core-metrics/route"))["POST"];
  let getCoreMetrics: (typeof import("../../src/app/api/pets/[petId]/health/core-metrics/route"))["GET"];
  let postLabResults: (typeof import("../../src/app/api/pets/[petId]/health/lab-results/route"))["POST"];
  let getTrends: (typeof import("../../src/app/api/pets/[petId]/health/trends/route"))["GET"];

  beforeAll(async () => {
    const prismaModule = await import("@/lib/prisma");
    const coreRouteModule = await import("../../src/app/api/pets/[petId]/health/core-metrics/route");
    const labRouteModule = await import("../../src/app/api/pets/[petId]/health/lab-results/route");
    const trendsRouteModule = await import("../../src/app/api/pets/[petId]/health/trends/route");

    prisma = prismaModule.prisma;
    postCoreMetrics = coreRouteModule.POST;
    getCoreMetrics = coreRouteModule.GET;
    postLabResults = labRouteModule.POST;
    getTrends = trendsRouteModule.GET;

    await prisma.household.create({
      data: {
        id: householdId,
        name: `db-test-household-${householdId.slice(0, 8)}`
      }
    });

    await prisma.pet.create({
      data: {
        id: petId,
        householdId,
        name: "DB Test Pet",
        species: "cat"
      }
    });

    await prisma.userSubscription.upsert({
      where: { userId: authenticatedUserId },
      create: {
        userId: authenticatedUserId,
        status: "ACTIVE"
      },
      update: {
        status: "ACTIVE",
        graceUntil: null
      }
    });
  });

  afterAll(async () => {
    await prisma.userSubscription.deleteMany({ where: { userId: authenticatedUserId } });
    await prisma.household.deleteMany({ where: { id: householdId } });
    await prisma.$disconnect();
  });

  it("persists core/lab records and reflects them in trends", async () => {
    const coreResponse = await postCoreMetrics(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WEIGHT_KG",
          value: 4.4,
          recordedAt: "2026-04-26"
        })
      }),
      { params: Promise.resolve({ petId }) }
    );
    expect(coreResponse.status).toBe(201);

    const labResponse = await postLabResults(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "BLOOD",
          marker: "CRE",
          value: 1.2,
          recordedAt: "2026-04-26"
        })
      }),
      { params: Promise.resolve({ petId }) }
    );
    expect(labResponse.status).toBe(201);
    const labPayload = await labResponse.json();
    expect(labPayload.data.category).toBe("BLOOD");
    expect(labPayload.data.unit).toBe("mg/dL");

    const coreListResponse = await getCoreMetrics(new Request("http://localhost?type=WEIGHT_KG"), {
      params: Promise.resolve({ petId })
    });
    expect(coreListResponse.status).toBe(200);
    const coreListPayload = await coreListResponse.json();
    expect(coreListPayload.data).toHaveLength(1);

    const trendsResponse = await getTrends(new Request("http://localhost"), {
      params: Promise.resolve({ petId })
    });
    expect(trendsResponse.status).toBe(200);
    const trendsPayload = await trendsResponse.json();
    expect(trendsPayload.data.series).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: "core:WEIGHT_KG" }), expect.objectContaining({ key: "lab:CRE" })])
    );
  });
});
