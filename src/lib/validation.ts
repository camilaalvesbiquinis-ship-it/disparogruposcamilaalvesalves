/**
 * Input validation and sanitization utilities.
 * Applied client-side before any data is sent to the backend.
 */
import { z } from "zod";

/** Sanitize text input - remove potential script injection patterns */
export function sanitizeText(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<\/?(?:iframe|object|embed|form|input|button)[^>]*>/gi, "")
    .trim();
}

/** Check for SQL injection patterns */
export function containsSQLInjection(input: string): boolean {
  const patterns = [
    /('|"|;)\s*(DROP|ALTER|DELETE|INSERT|UPDATE|SELECT|UNION|CREATE|EXEC)\s/i,
    /(--)|(\/\*)|(\*\/)/,
    /\b(OR|AND)\b\s+\d+\s*=\s*\d+/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** Broadcast message validation schema */
export const broadcastMessageSchema = z.object({
  message: z
    .string()
    .max(4096, "Mensagem deve ter no máximo 4096 caracteres")
    .optional(),
  contentType: z.enum(["text", "image", "video", "pdf", "catalog", "link"]),
  mediaUrl: z
    .string()
    .url("URL de mídia inválida")
    .optional()
    .or(z.literal("")),
  mentionAll: z.boolean().optional(),
});

/** Phone/WhatsApp JID validation */
export const phoneJIDSchema = z
  .string()
  .regex(/^\d+@g\.us$/, "Formato de ID de grupo inválido");

/** CPF validation schema */
export const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, "CPF deve conter 11 dígitos")
  .refine((val) => {
    if (/^(\d)\1{10}$/.test(val)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(val[i]) * (10 - i);
    let r = (sum * 10) % 11;
    if (r === 10) r = 0;
    if (r !== parseInt(val[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(val[i]) * (11 - i);
    r = (sum * 10) % 11;
    if (r === 10) r = 0;
    return r === parseInt(val[10]);
  }, "CPF inválido");

/** Brazilian phone schema */
export const brazilianPhoneSchema = z
  .string()
  .regex(/^[1-9]{2}9?\d{8}$/, "Telefone inválido (DDD + número)");

/** Email schema */
export const emailSchema = z.string().email("Email inválido").max(255);
