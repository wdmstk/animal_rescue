import { z } from "zod";

export const householdRoleSchema = z.enum(["OWNER", "FAMILY"]);

export const householdMemberRoleUpdateSchema = z.object({
  role: householdRoleSchema
});
