/**
 * Reusable component for displaying sensitive/PII data in masked form.
 * Only authorized users (gerente) can reveal the full value.
 */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskCPF, maskEmail, maskPhone, maskGeneric } from "@/lib/masks";

type FieldType = "cpf" | "email" | "phone" | "generic";

interface SensitiveFieldProps {
  value: string;
  canReveal?: boolean;
  type?: FieldType;
  recordId?: string;
  tableName?: string;
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
  className = "",
}: SensitiveFieldProps) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return <span className={`text-muted-foreground ${className}`}>—</span>;

  const masked = maskFunctions[type](value);

  const handleReveal = () => {
    if (!canReveal) return;
    setRevealed(!revealed);
  };
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
