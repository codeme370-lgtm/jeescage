// lib/prisma.js
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

let prisma;

// Configure Neon
neonConfig.webSocketConstructor = ws;

// Skip Prisma initialization during build (e.g. during `next build`)
if (process.env.BUILDING === "true") {
  prisma = {
    $connect: async () => {},
    $disconnect: async () => {},
    $executeRaw: async () => {},
    $queryRaw: async () => [],
  };
} else {
  // Create Neon adapter for Prisma v7
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL || "",
    directUrl: process.env.DIRECT_URL,
  });

  // Prepare PrismaClient options. If an adapter is available, pass it.
  const clientOptions = adapter ? { adapter } : {};

  // Use a global singleton in development to avoid multiple instances
  if (process.env.NODE_ENV === "development") {
    if (!globalThis.__prisma) {
      globalThis.__prisma = new PrismaClient(clientOptions);
    }
    prisma = globalThis.__prisma;
  } else {
    prisma = new PrismaClient(clientOptions);
  }
}

export default prisma;
