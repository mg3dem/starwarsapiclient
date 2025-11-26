import { createHonoServer } from "react-router-hono-server/node";
import { i18next } from "remix-hono/i18next";
import i18nextOpts from "../localization/i18n.server";
import { getLoadContext } from "./context";
import { closeQueue, initializeQueue } from "~/queue/jobs.server";
import { closeRedis } from "~/queue/redis.server";
import { closeDb } from "~/db/client.server";

await initializeQueue();

const shutdown = async () => {
  // biome-ignore lint/suspicious/noConsole
  console.log("\nShutting down gracefully...");
  await closeQueue();
  await closeRedis();
  closeDb();
  // biome-ignore lint/suspicious/noConsole
  console.log("Cleanup complete");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default await createHonoServer({
  configure(server) {
    server.use("*", i18next(i18nextOpts));
  },
  defaultLogger: false,
  getLoadContext
});
