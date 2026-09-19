import { Redis } from "@upstash/redis";

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
export const redis = Redis.fromEnv();

export const recapKey = (id: string) => `recap:${id}`;
