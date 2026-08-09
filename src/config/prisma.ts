import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Reuse a single PrismaClient instance (important in dev with ts-node-dev/nodemon
// to avoid exhausting DB connections on hot reload).
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: env.isProd ? ["error", "warn"] : ["error", "warn", "query"],
  });

if (!env.isProd) {
  global.__prisma__ = prisma;
}
