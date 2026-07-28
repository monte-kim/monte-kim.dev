/**
 * Per-instance sliding-window rate limiter. Serverless instances don't share
 * this map, so it caps burst spam per instance rather than globally — paired
 * with the honeypot fields that's the right cost/benefit for a personal blog
 * on free tiers (a shared store like Upstash/KV would be the upgrade path).
 */
const buckets = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const stamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (stamps.length >= limit) {
    buckets.set(key, stamps);
    return true;
  }
  stamps.push(now);
  buckets.set(key, stamps);
  return false;
}
