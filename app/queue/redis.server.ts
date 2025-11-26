import { createClient } from "redis";
import { getServerEnv } from "~/env.server";

let redisClient: ReturnType<typeof createClient>;

export async function getRedis() {
  if (!redisClient) {
    const env = getServerEnv();
    redisClient = createClient({ url: env.REDIS_URL });

    redisClient.on("error", err => {
      // biome-ignore lint/suspicious/noConsole
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    // biome-ignore lint/suspicious/noConsole
    console.log("Redis connected successfully");
  }
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}
