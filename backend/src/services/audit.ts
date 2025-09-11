import { prisma } from '../server.js';

export interface AuditLogEntry {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp?: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Since we don't have an AuditLog model in the schema, we'll log to console and file
// In production, you'd want to add an AuditLog table to the Prisma schema
export const auditLog = async (
  userId: string,
  action: string,
  details: Record<string, any>,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
) => {
  const logEntry: AuditLogEntry = {
    userId,
    action,
    details,
    timestamp: new Date(),
    ...metadata,
  };

  // Log to console (structured logging)
  console.info('AUDIT_LOG', logEntry);

  // In production, you would:
  // 1. Store in database audit table
  // 2. Send to external logging service (e.g., Splunk, ELK)
  // 3. Ensure compliance with retention policies
  
  try {
    // Store critical audit events in database
    // For now, we'll use a simple approach - in production add AuditLog model
    if (isCriticalAction(action)) {
      // You could store in a dedicated audit table or use existing tables
      // This is a placeholder for proper audit trail implementation
      console.warn(`CRITICAL_AUDIT_EVENT: ${action} by user ${userId}`, details);
    }
  } catch (error) {
    // Audit logging should never fail the main operation
    console.error('Failed to write audit log:', error);
  }
};

const isCriticalAction = (action: string): boolean => {
  const criticalActions = [
    'WIPE_JOB_CREATED',
    'WIPE_JOB_STARTED',
    'WIPE_JOB_COMPLETED',
    'CERTIFICATE_GENERATED',
    'CERTIFICATE_UPLOADED',
    'BLOCKCHAIN_ANCHOR_CREATED',
    'USER_LOGIN',
    'USER_CREATED',
    'AGENT_ENROLLED',
  ];
  
  return criticalActions.includes(action);
};

export const getAuditLogs = async (filters: {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  // In production, this would query the audit log table
  // For now, return empty array as placeholder
  return {
    logs: [],
    total: 0,
    message: 'Audit log retrieval not implemented - logs are written to console and external systems',
  };
};