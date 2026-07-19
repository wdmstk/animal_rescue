import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/pet-access";
import { requireAdminUserForApi } from "@/lib/admin/require-admin";
import { createAuditLog } from "@/lib/audit-log";

// Hoist mocks
const { findManyMock, findUniqueMock, createMock, updateMock, transactionMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  transactionMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock
    },
    ticketMessage: {
      create: createMock
    },
    ownerProfile: {
      findUnique: findUniqueMock
    },
    $transaction: transactionMock
  }
}));

vi.mock("@/lib/auth/pet-access", () => ({
  requireAuthenticatedUser: vi.fn()
}));

vi.mock("@/lib/admin/require-admin", () => ({
  requireAdminUserForApi: vi.fn()
}));

vi.mock("@/lib/audit-log", () => ({
  createAuditLog: vi.fn(),
  AuditAction: {
    ADMIN_TICKET_REPLY: "ADMIN_TICKET_REPLY",
    ADMIN_TICKET_STATUS_CHANGE: "ADMIN_TICKET_STATUS_CHANGE"
  },
  EntityType: {
    TICKET: "TICKET"
  }
}));

import { GET as getTickets, POST as createTicket } from "../../src/app/api/support/tickets/route";
import { GET as getTicketDetail } from "../../src/app/api/support/tickets/[id]/route";
import { POST as replyToTicket } from "../../src/app/api/support/tickets/[id]/messages/route";
import { GET as adminGetTickets } from "../../src/app/api/admin/tickets/route";
import { GET as adminGetTicketDetail } from "../../src/app/api/admin/tickets/[id]/route";
import { POST as adminReplyToTicket } from "../../src/app/api/admin/tickets/[id]/messages/route";
import { PATCH as adminUpdateStatus } from "../../src/app/api/admin/tickets/[id]/status/route";

describe("Support Ticket API System", () => {
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);
  const requireAdminUserForApiMock = vi.mocked(requireAdminUserForApi);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User support API", () => {
    it("returns unauthorized when not logged in", async () => {
      requireAuthenticatedUserMock.mockResolvedValue(
        NextResponse.json({ error: "認証が必要です" }, { status: 401 })
      );

      const res = await getTickets();
      expect(res.status).toBe(401);
    });

    it("returns tickets list on GET", async () => {
      requireAuthenticatedUserMock.mockResolvedValue({ userId: "user-123" });
      findManyMock.mockResolvedValue([{ id: "ticket-1", title: "Test Ticket", status: "OPEN" }]);

      const res = await getTickets();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(findManyMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: "user-123" }
      }));
    });

    it("creates a ticket on POST with transaction", async () => {
      requireAuthenticatedUserMock.mockResolvedValue({ userId: "user-123" });
      transactionMock.mockImplementation(async (callback) => {
        return callback({
          ticket: {
            create: vi.fn().mockResolvedValue({ id: "new-ticket-id", title: "New Ticket" })
          },
          ticketMessage: {
            create: vi.fn()
          }
        });
      });

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          title: "Inquiry about billing",
          category: "BILLING",
          message: "Please help!"
        })
      });

      const res = await createTicket(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.title).toBe("New Ticket");
    });

    it("fetches ticket details for owner", async () => {
      requireAuthenticatedUserMock.mockResolvedValue({ userId: "user-123" });
      findUniqueMock.mockResolvedValue({ id: "ticket-1", userId: "user-123", messages: [] });

      const res = await getTicketDetail(new Request("http://localhost"), {
        params: Promise.resolve({ id: "ticket-1" })
      });
      expect(res.status).toBe(200);
    });

    it("returns forbidden if user is not ticket owner", async () => {
      requireAuthenticatedUserMock.mockResolvedValue({ userId: "other-user" });
      findUniqueMock.mockResolvedValue({ id: "ticket-1", userId: "user-123", messages: [] });

      const res = await getTicketDetail(new Request("http://localhost"), {
        params: Promise.resolve({ id: "ticket-1" })
      });
      expect(res.status).toBe(403);
    });
  });

  describe("Admin Support API", () => {
    it("returns forbidden for non-admins", async () => {
      requireAdminUserForApiMock.mockResolvedValue(
        NextResponse.json({ error: "Forbidden" }, { status: 403 })
      );

      const res = await adminGetTickets(new Request("http://localhost"));
      expect(res.status).toBe(403);
    });

    it("allows admin to view all tickets", async () => {
      requireAdminUserForApiMock.mockResolvedValue({ id: "admin-id", email: "admin@example.com" });
      findManyMock.mockResolvedValue([{ id: "ticket-1", title: "Test Ticket" }]);

      const res = await adminGetTickets(new Request("http://localhost"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
    });

    it("allows admin to reply and writes audit log", async () => {
      requireAdminUserForApiMock.mockResolvedValue({ id: "admin-id", email: "admin@example.com" });
      findUniqueMock.mockResolvedValue({ id: "ticket-1", userId: "user-123" });
      transactionMock.mockImplementation(async (callback) => {
        return callback({
          ticketMessage: {
            create: vi.fn().mockResolvedValue({ id: "msg-123", body: "Hello" })
          },
          ticket: {
            update: vi.fn()
          }
        });
      });

      const req = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ body: "This is admin reply" })
      });

      const res = await adminReplyToTicket(req, {
        params: Promise.resolve({ id: "ticket-1" })
      });

      expect(res.status).toBe(201);
      expect(createAuditLog).toHaveBeenCalled();
    });

    it("allows admin to update status and writes audit log", async () => {
      requireAdminUserForApiMock.mockResolvedValue({ id: "admin-id", email: "admin@example.com" });
      findUniqueMock.mockResolvedValue({ id: "ticket-1", status: "OPEN" });
      updateMock.mockResolvedValue({ id: "ticket-1", status: "RESOLVED" });

      const req = new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ status: "RESOLVED" })
      });

      const res = await adminUpdateStatus(req, {
        params: Promise.resolve({ id: "ticket-1" })
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.status).toBe("RESOLVED");
      expect(createAuditLog).toHaveBeenCalled();
    });
  });
});
