import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const TOTAL_KEY = "openai_total_requests";

export async function getTotalRequests(): Promise<number> {
  if (!redis) return 0;
  const val = await redis.get<number>(TOTAL_KEY);
  return val ?? 0;
}

export async function incrementTotalRequests(): Promise<void> {
  if (!redis) return;
  await redis.incr(TOTAL_KEY);
}

export function hasRedis() {
  return !!redis;
}

