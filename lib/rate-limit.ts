type RateLimitBucketState = {
  count: number;
  resetAt: number;
};

type ConsumeRateLimitInput = {
  bucket: string;
  identifier: string;
  max: number;
  windowMs: number;
  nowMs?: number;
};

type ConsumeRateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

declare global {
  var atlasRateLimitStore: Map<string, RateLimitBucketState> | undefined;
}

function getRateLimitStore(): Map<string, RateLimitBucketState> {
  if (!global.atlasRateLimitStore) {
    global.atlasRateLimitStore = new Map<string, RateLimitBucketState>();
  }

  return global.atlasRateLimitStore;
}

function toRateLimitKey(bucket: string, identifier: string): string {
  return `${bucket}:${identifier}`;
}

export function consumeRateLimit(
  input: ConsumeRateLimitInput,
): ConsumeRateLimitResult {
  const now = input.nowMs ?? Date.now();
  const max = Math.max(1, Math.floor(input.max));
  const windowMs = Math.max(1, Math.floor(input.windowMs));
  const key = toRateLimitKey(input.bucket, input.identifier || "unknown");
  const store = getRateLimitStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: Math.max(0, max - 1),
      resetAt,
      retryAfterMs: 0,
    };
  }

  const nextCount = existing.count + 1;
  const allowed = nextCount <= max;
  store.set(key, {
    count: nextCount,
    resetAt: existing.resetAt,
  });

  return {
    allowed,
    remaining: allowed ? Math.max(0, max - nextCount) : 0,
    resetAt: existing.resetAt,
    retryAfterMs: allowed ? 0 : Math.max(0, existing.resetAt - now),
  };
}

export function resetRateLimitStore(): void {
  getRateLimitStore().clear();
}
