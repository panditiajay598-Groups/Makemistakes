import { validateSessionSecretConfiguration } from "@/lib/security/sessionSecret";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDns } = await import("./lib/dns");
    initDns();
  }
  validateSessionSecretConfiguration();
}
