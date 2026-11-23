// Simple in-memory limiter. On serverless each instance has its own memory, so this is a
// best-effort speed bump. For strict limits, put Cloudflare/Vercel WAF rate limiting in front.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return true;
}
