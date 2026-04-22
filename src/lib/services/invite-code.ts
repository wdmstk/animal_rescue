import { randomBytes } from "crypto";

export const generateInviteCode = (): string => randomBytes(5).toString("hex").toUpperCase();

export const calculateExpiry = (hours: number): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
