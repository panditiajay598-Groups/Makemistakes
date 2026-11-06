import { initDns } from "../../src/lib/dns";
import { PrismaClient } from "@prisma/client";

initDns();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getErrorCode(error: unknown): string | undefined {
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "";
  const directCode =
    error && typeof error === "object" && "code" in error &&
    typeof error.code === "string"
      ? error.code
      : undefined;
  return (
    directCode ??
    message.match(/\b(P\d{4}|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|querySrv)\b/i)?.[0]
  );
}

function isConnectionError(code: string | undefined): boolean {
  return Boolean(
    code &&
      (/^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|querySrv)$/i.test(code) ||
        ["P1001", "P1002", "P1008", "P1017"].includes(code.toUpperCase()))
  );
}

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ emit: "event", level: "query" }, "warn", { emit: "event", level: "error" }]
        : [{ emit: "event", level: "query" }, { emit: "event", level: "error" }],
  });
  let connected = false;
  let connectionInterrupted = false;

  client.$on("query", () => {
    if (connectionInterrupted) {
      console.info("[mongodb] Prisma database connection recovered.");
      connectionInterrupted = false;
    } else if (!connected) {
      console.info("[mongodb] Prisma connected to MongoDB.");
    }
    connected = true;
  });

  client.$on("error", (event) => {
    const code = getErrorCode(event.message);
    const dnsError = /^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|querySrv)$/i.test(
      code ?? ""
    );
    console.error(
      dnsError
        ? "[mongodb] Prisma could not resolve the MongoDB DNS record."
        : "[mongodb] Prisma database operation failed.",
      { code }
    );
    if (isConnectionError(code)) connectionInterrupted = true;
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
