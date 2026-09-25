/**
 * Edge-compatible Rate Limiting for SAAR Lead Delivery.
 * Employs IP anonymization (SHA-256) and sliding-window rate tracking.
 * Supports optional Cloudflare KV binding ('RATE_LIMIT_KV') or in-memory fallback.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // Max 5 submissions per 10 minutes

// In-memory sliding window store for single-instance / local execution
interface RateBucket {
  timestamps: number[];
}

const memoryStore = new Map<string, RateBucket>();

// Helper to anonymize IP address before storage
async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(`saar-salt-${ip}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }
  // Simple fallback hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < enc.length; i++) {
    hash = (hash << 5) - hash + enc[i];
    hash |= 0;
  }
  return `h-${Math.abs(hash)}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export async function checkRateLimit(
  clientIp: string,
  kvBinding?: { get: (k: string) => Promise<string | null>; put: (k: string, v: string, opts?: { expirationTtl?: number }) => Promise<void> }
): Promise<RateLimitResult> {
  const now = Date.now();
  const anonymizedKey = `rl:${await hashIp(clientIp || '127.0.0.1')}`;

  // If Cloudflare KV binding is available
  if (kvBinding && typeof kvBinding.get === 'function' && typeof kvBinding.put === 'function') {
    try {
      const raw = await kvBinding.get(anonymizedKey);
      let timestamps: number[] = raw ? JSON.parse(raw) : [];
      timestamps = timestamps.filter((t) => now - t < WINDOW_MS);

      if (timestamps.length >= MAX_REQUESTS) {
        const oldest = timestamps[0];
        return {
          allowed: false,
          remaining: 0,
          resetMs: WINDOW_MS - (now - oldest),
        };
      }

      timestamps.push(now);
      await kvBinding.put(anonymizedKey, JSON.stringify(timestamps), {
        expirationTtl: Math.ceil(WINDOW_MS / 1000),
      });

      return {
        allowed: true,
        remaining: MAX_REQUESTS - timestamps.length,
        resetMs: WINDOW_MS,
      };
    } catch {
      // If KV fails, fall through to in-memory check
    }
  }

  // In-memory sliding window fallback
  const bucket = memoryStore.get(anonymizedKey) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: WINDOW_MS - (now - oldest),
    };
  }

  bucket.timestamps.push(now);
  memoryStore.set(anonymizedKey, bucket);

  // Periodically clean stale memory buckets
  if (memoryStore.size > 1000) {
    for (const [k, v] of memoryStore.entries()) {
      v.timestamps = v.timestamps.filter((t) => now - t < WINDOW_MS);
      if (v.timestamps.length === 0) memoryStore.delete(k);
    }
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - bucket.timestamps.length,
    resetMs: WINDOW_MS,
  };
}

/** Resets rate limits (used exclusively in local integration tests) */
export function _resetRateLimitsForTesting(): void {
  memoryStore.clear();
}
