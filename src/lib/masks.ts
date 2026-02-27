/**
 * Data masking utilities for sensitive fields.
 * Used to display PII in masked format with optional reveal.
 */

/** Mask CPF: 123.456.789-00 → ***.***.*89-00 */
export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return "***.***.***-**";
  return `***.***.*${clean.slice(7, 9)}-${clean.slice(9)}`;
}

/** Mask email: user@example.com → u***@e***.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***.***";
  const domParts = domain.split(".");
  const maskedLocal = local[0] + "***";
  const maskedDomain = domParts[0][0] + "***" + "." + domParts.slice(1).join(".");
  return `${maskedLocal}@${maskedDomain}`;
}

/** Mask phone: (11) 99999-1234 → (XX) XXXXX-**34 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "(XX) XXXXX-****";
  return `(XX) XXXXX-**${clean.slice(-2)}`;
}

/** Mask generic string: show first and last 2 chars */
export function maskGeneric(value: string): string {
  if (value.length <= 4) return "****";
  return value[0] + "*".repeat(value.length - 3) + value.slice(-2);
}

/** Validate CPF using official algorithm */
export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(clean[10]);
}

/** Validate Brazilian phone (with DDD) */
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return /^[1-9]{2}9?\d{8}$/.test(clean);
}

/** Validate email format */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
