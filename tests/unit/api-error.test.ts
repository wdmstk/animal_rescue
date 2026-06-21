import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiError, badRequest, unauthorized, forbidden, notFound, paymentRequired, serverError } from "../../src/lib/api-error";

describe("api-error", () => {
  describe("apiError", () => {
    it("returns error response with default 500 status", () => {
      const response = apiError("test error");
      expect(response.status).toBe(500);
    });

    it("returns error response with custom status", () => {
      const response = apiError("test error", 400);
      expect(response.status).toBe(400);
    });

    it("logs error to console", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      apiError("test error");
      expect(consoleSpy).toHaveBeenCalledWith("API Error [500]:", "test error");
      consoleSpy.mockRestore();
    });

    it("handles object error message", () => {
      const errorMessage = { field: "value" };
      const response = apiError(errorMessage);
      expect(response.status).toBe(500);
    });
  });

  describe("badRequest", () => {
    it("returns 400 status with string message", () => {
      const response = badRequest("invalid input");
      expect(response.status).toBe(400);
    });

    it("returns 400 status with ZodError", () => {
      const schema = z.object({ name: z.string() });
      const result = schema.safeParse({ name: 123 });
      if (!result.success) {
        const response = badRequest(result.error);
        expect(response.status).toBe(400);
      }
    });

    it("flattens ZodError", async () => {
      const schema = z.object({ name: z.string() });
      const result = schema.safeParse({ name: 123 });
      if (!result.success) {
        const response = badRequest(result.error);
        const data = await response.json();
        expect(data).toHaveProperty("error");
      }
    });
  });

  describe("unauthorized", () => {
    it("returns 401 status with default message", () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
    });

    it("returns 401 status with custom message", () => {
      const response = unauthorized("custom auth error");
      expect(response.status).toBe(401);
    });
  });

  describe("forbidden", () => {
    it("returns 403 status with default message", () => {
      const response = forbidden();
      expect(response.status).toBe(403);
    });

    it("returns 403 status with custom message", () => {
      const response = forbidden("custom forbidden error");
      expect(response.status).toBe(403);
    });
  });

  describe("notFound", () => {
    it("returns 404 status with default resource name", () => {
      const response = notFound();
      expect(response.status).toBe(404);
    });

    it("returns 404 status with custom resource name", () => {
      const response = notFound("Pet");
      expect(response.status).toBe(404);
    });
  });

  describe("paymentRequired", () => {
    it("returns 402 status with default message", () => {
      const response = paymentRequired();
      expect(response.status).toBe(402);
    });

    it("returns 402 status with custom message", () => {
      const response = paymentRequired("upgrade required");
      expect(response.status).toBe(402);
    });
  });

  describe("serverError", () => {
    it("returns 500 status with default message", () => {
      const response = serverError();
      expect(response.status).toBe(500);
    });

    it("returns 500 status with custom message", () => {
      const response = serverError("custom server error");
      expect(response.status).toBe(500);
    });
  });
});
