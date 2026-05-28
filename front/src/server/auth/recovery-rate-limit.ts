const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

type RequestBucket = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, RequestBucket>();

function getClientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "local"
  );
}

export function isRecoveryRequestLimited(request: Request, identity: string) {
  const now = Date.now();
  const key = `${getClientAddress(request)}:${identity.trim().toLowerCase()}`;
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    return false;
  }

  current.count += 1;
  requestBuckets.set(key, current);

  return current.count > MAX_REQUESTS;
}
