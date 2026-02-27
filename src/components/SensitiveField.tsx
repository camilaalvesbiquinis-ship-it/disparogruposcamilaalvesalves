/**
 * Reusable component for displaying sensitive/PII data in masked form.
 * Only authorized users (gerente) can reveal the full value.
 * Reveals are logged in audit_logs.
 */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logAuditAction } from "@/lib/audit";
import { maskCPF, maskEmail, maskPhone, maskGeneric } from "@/lib/masks";

type FieldType = "cpf" | "email" | "phone" | "generic";

interface SensitiveFieldProps {
  /** The actual unmasked value */
  value: string;
  /** Whether the current user is allowed to reveal the value */
  canReveal?: boolean;
  /** Type of field for appropriate masking */
  type?: FieldType;
  /** Optional record ID for audit logging */
  recordId?: string;
  /** Optional table name for audit logging */
  tableName?: string;
  /** Additional CSS classes */
  className?: string;
}

const maskFunctions: Record<FieldType, (v: string) => string> = {
  cpf: maskCPF,
  email: maskEmail,
  phone: maskPhone,
  generic: maskGeneric,
};

export function SensitiveField({
  value,
  canReveal = false,
  type = "generic",
  recordId,
  tableName,
  className = "",
}: SensitiveFieldProps) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return <span className={`text-muted-foreground ${className}`}>—</span>;

  const masked = maskFunctions[type](value);

  const handleReveal = async () => {
    if (!canReveal) return;
    const next = !revealed;
    setRevealed(next);

    if (next) {
      // Log the decrypt/reveal action
      await logAuditAction({
        action: "decrypt",
        tableName: tableName ?? "unknown",
        recordId: recordId ?? "unknown",
        details: { field_type: type },
      });
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="font-mono text-sm">
        {revealed ? value : masked}
      </span>
      {canReveal && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleReveal}
          title={revealed ? "Ocultar" : "Revelar"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      )}
    </span>
  );
}
