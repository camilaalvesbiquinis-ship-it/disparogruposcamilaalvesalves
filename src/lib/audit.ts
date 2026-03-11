/**
 * Audit logging utility for tracking sensitive data access and modifications.
 * All actions involving PII or sensitive data generate an audit record.
 */
import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "view"
  | "edit"
  | "delete"
  | "export"
  | "decrypt"
  | "login"
  | "logout"
  | "role_change"
  | "consent_change"
  | "data_request"
  | "schedule";

interface AuditParams {
  action: AuditAction;
  tableName?: string;
  recordId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an audit action for the current authenticated user.
 * Silently fails to avoid disrupting the main flow.
 */
export async function logAuditAction({ action, tableName, recordId, details }: AuditParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase.from("audit_logs") as any).insert({
      user_id: user.id,
      action,
      table_name: tableName ?? null,
      record_id: recordId ?? null,
      details: details ?? {},
      user_agent: navigator.userAgent,
    });
  } catch {
    // Audit logging should never break the main flow
  }
}
