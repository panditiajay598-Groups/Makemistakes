import type { EnsureIndexesResult } from "./lib/dbIndexes";
import { validateSessionSecretConfiguration } from "@/lib/security/sessionSecret";

/**
 * Next.js instrumentation hook.
 *
 * - Initializes resilient custom DNS (all runtimes).
 * - Validates session secret configuration (all runtimes).
 * - Runs idempotent MongoDB index initialization at server startup, only for
 *   production Vercel deployments. Local and preview environments skip index
 *   initialization entirely.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDns } = await import("./lib/dns");
    initDns();
  }

  validateSessionSecretConfiguration();

  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.VERCEL_ENV !== "production") {
    console.info("[indexes] skipping initialization: not a Vercel production environment");
    return;
  }

  try {
    const { ensureAppIndexes } = await import("./lib/dbIndexes");
    const results: EnsureIndexesResult[] = await ensureAppIndexes();

    const failures = results.filter((r) => r.status === "error");
    const ok = results.filter((r) => r.status !== "error");

    for (const r of ok) {
      console.info(
        `[indexes] ${r.collection}.${r.name}: ${r.status}${r.details ? ` — ${r.details}` : ""}`
      );
    }

    if (failures.length > 0) {
      for (const r of failures) {
        console.error(
          `[indexes] failed ${r.collection}.${r.name}: ${r.details || "unknown error"}`
        );
      }
      console.error(`[indexes] ${failures.length}/${results.length} index initialization(s) failed`);
      return;
    }

    console.info(`[indexes] all ${results.length} index initialization(s) completed successfully`);
  } catch (err) {
    console.error("[indexes] initialization failed with exception", err);
  }
}
