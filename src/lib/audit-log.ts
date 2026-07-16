import { prisma } from "@/lib/prisma";

export enum AuditAction {
  // Pet operations
  PET_CREATE = "PET_CREATE",
  PET_UPDATE = "PET_UPDATE",
  PET_DELETE = "PET_DELETE",
  
  // Emergency info operations
  EMERGENCY_INFO_UPDATE = "EMERGENCY_INFO_UPDATE",
  
  // Medical record operations
  MEDICAL_RECORD_CREATE = "MEDICAL_RECORD_CREATE",
  MEDICAL_RECORD_UPDATE = "MEDICAL_RECORD_UPDATE",
  MEDICAL_RECORD_DELETE = "MEDICAL_RECORD_DELETE",
  
  // Medication operations
  MEDICATION_CREATE = "MEDICATION_CREATE",
  MEDICATION_UPDATE = "MEDICATION_UPDATE",
  MEDICATION_DELETE = "MEDICATION_DELETE",
  
  // Vaccination operations
  VACCINATION_CREATE = "VACCINATION_CREATE",
  VACCINATION_UPDATE = "VACCINATION_UPDATE",
  VACCINATION_DELETE = "VACCINATION_DELETE",
  
  // Household operations
  HOUSEHOLD_CREATE = "HOUSEHOLD_CREATE",
  HOUSEHOLD_UPDATE = "HOUSEHOLD_UPDATE",
  HOUSEHOLD_DELETE = "HOUSEHOLD_DELETE",
  
  // Member operations
  MEMBER_INVITE = "MEMBER_INVITE",
  MEMBER_ROLE_CHANGE = "MEMBER_ROLE_CHANGE",
  MEMBER_REMOVE = "MEMBER_REMOVE",
  
  // Subscription operations
  SUBSCRIPTION_CREATE = "SUBSCRIPTION_CREATE",
  SUBSCRIPTION_UPDATE = "SUBSCRIPTION_UPDATE",
  SUBSCRIPTION_CANCEL = "SUBSCRIPTION_CANCEL",
  
  // Account operations
  ACCOUNT_DELETE = "ACCOUNT_DELETE",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export enum EntityType {
  PET = "PET",
  EMERGENCY_INFO = "EMERGENCY_INFO",
  MEDICAL_RECORD = "MEDICAL_RECORD",
  MEDICATION = "MEDICATION",
  VACCINATION = "VACCINATION",
  HOUSEHOLD = "HOUSEHOLD",
  MEMBER = "MEMBER",
  SUBSCRIPTION = "SUBSCRIPTION",
  USER = "USER",
}

export interface AuditLogOptions {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 監査ログを記録する関数
 * 重要な操作を追跡・監査するために使用
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    // Check if AuditLog model exists in Prisma client
    if (!prisma.auditLog) {
      console.warn("AuditLog model not available in Prisma client. Skipping audit log.");
      return;
    }
    
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        changes: options.changes ? JSON.stringify(options.changes) : null,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  } catch (error) {
    // 監査ログの記録に失敗しても、主要な処理には影響させない
    console.error("Failed to create audit log:", error);
  }
}

/**
 * ペット関連の監査ログを記録するヘルパー関数
 */
export async function logPetAction(
  userId: string,
  action: AuditAction,
  petId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    entityType: EntityType.PET,
    entityId: petId,
    changes,
    ipAddress,
    userAgent,
  });
}

/**
 * 緊急情報関連の監査ログを記録するヘルパー関数
 */
export async function logEmergencyInfoAction(
  userId: string,
  action: AuditAction,
  petId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    entityType: EntityType.EMERGENCY_INFO,
    entityId: petId,
    changes,
    ipAddress,
    userAgent,
  });
}

/**
 * メンバー関連の監査ログを記録するヘルパー関数
 */
export async function logMemberAction(
  userId: string,
  action: AuditAction,
  memberId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    entityType: EntityType.MEMBER,
    entityId: memberId,
    changes,
    ipAddress,
    userAgent,
  });
}