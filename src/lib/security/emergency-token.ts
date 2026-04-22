import { randomUUID } from "crypto";

export const generateEmergencyToken = (): string => randomUUID();

export const isEmergencyToken = (token: string): boolean => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(token);
};
