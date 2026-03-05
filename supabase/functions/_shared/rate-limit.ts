/**
 * Simple in-memory rate limiter for edge functions.
 * Tracks requests per IP with configurable limits.
 */
const ipCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    const retryAfterMs = entry.resetAt - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

export function rateLimitResponse(retryAfterMs: number, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "Muitas requisições. Aguarde antes de tentar novamente.",
      retry_after_seconds: Math.ceil(retryAfterMs / 1000),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
      },
    }
  );
}
