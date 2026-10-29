import dns from "dns";

/**
 * MakeMistakes Centralized DNS Configuration
 *
 * Objective:
 * Centralize Node.js process-wide DNS resolver configuration to ensure reliable
 * MongoDB Atlas SRV/TXT record resolution across local development, tests, and production.
 *
 * Background & Need:
 * On certain platforms (notably Windows local development, WSL, or specific ISP/router
 * configurations), Node's underlying c-ares resolver defaults to loopback (127.0.0.1) or
 * resolvers that fail SRV/TXT queries for `mongodb+srv://` connection strings with
 * `querySrv ECONNREFUSED` or timeouts.
 *
 * Behavior & Overrides:
 * 1. Idempotent: Executes at most once per process runtime via globalThis.__dnsConfigured.
 * 2. Respects System / Container DNS: If `DISABLE_CUSTOM_DNS="true"` or `DNS_FALLBACK="false"`,
 *    it leaves system/container/VPC resolver settings completely untouched.
 * 3. Configurable: If `DNS_SERVERS` is set in the environment (comma-separated list, e.g. "1.1.1.1,8.8.8.8"),
 *    it sets exactly those custom servers.
 * 4. Safe Default Fallback: If not disabled, configures reliable public DNS resolvers
 *    ["8.8.8.8", "1.1.1.1", "8.8.4.4"] to ensure Atlas SRV resolution works reliably.
 * 5. Secret-Safe: Never logs credentials, database connection strings, or sensitive URLs.
 */

declare global {
  // eslint-disable-next-line no-var
  var __dnsConfigured: boolean | undefined;
}

export const DEFAULT_DNS_SERVERS = ["8.8.8.8", "1.1.1.1", "8.8.4.4"];

export interface DnsConfigStatus {
  configured: boolean;
  disabled: boolean;
  servers: string[];
  source: "system" | "custom_env" | "default_fallback";
}

let cachedStatus: DnsConfigStatus | null = null;

export function initDns(): DnsConfigStatus {
  // Check if custom DNS override is explicitly disabled (e.g. enterprise VPC, Docker, VPN)
  const isDisabled =
    process.env.DISABLE_CUSTOM_DNS === "true" ||
    process.env.DNS_FALLBACK === "false";

  if (isDisabled) {
    globalThis.__dnsConfigured = true;
    cachedStatus = {
      configured: true,
      disabled: true,
      servers: dns.getServers(),
      source: "system",
    };
    return cachedStatus;
  }

  // If already configured with target servers, return cached status
  const currentServers = dns.getServers();
  const alreadyConfigured =
    globalThis.__dnsConfigured &&
    cachedStatus &&
    DEFAULT_DNS_SERVERS.some((s) => currentServers.includes(s));
  if (alreadyConfigured && cachedStatus) {
    return cachedStatus;
  }

  // Check if explicit DNS servers are configured via environment
  const customEnvServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const targetServers =
    customEnvServers && customEnvServers.length > 0
      ? customEnvServers
      : DEFAULT_DNS_SERVERS;

  try {
    if (typeof (dns as any).setDefaultResultOrder === "function") {
      (dns as any).setDefaultResultOrder("ipv4first");
    }
    dns.setServers(targetServers);
    globalThis.__dnsConfigured = true;
    cachedStatus = {
      configured: true,
      disabled: false,
      servers: dns.getServers(),
      source: customEnvServers && customEnvServers.length > 0 ? "custom_env" : "default_fallback",
    };
  } catch {
    // If setServers fails (e.g. invalid IP, restricted runtime permissions), fallback to system DNS gracefully
    globalThis.__dnsConfigured = true;
    cachedStatus = {
      configured: false,
      disabled: false,
      servers: dns.getServers(),
      source: "system",
    };
  }

  return cachedStatus;
}

/**
 * Diagnostic helper to inspect DNS resolver status without leaking credentials or URIs.
 */
export function getDnsStatus(): DnsConfigStatus {
  return (
    cachedStatus ?? {
      configured: Boolean(globalThis.__dnsConfigured),
      disabled:
        process.env.DISABLE_CUSTOM_DNS === "true" ||
        process.env.DNS_FALLBACK === "false",
      servers: dns.getServers(),
      source: "system",
    }
  );
}

/**
 * Reset DNS configuration state strictly for test suite verification.
 * @internal
 */
export function _resetDnsForTesting(): void {
  globalThis.__dnsConfigured = undefined;
  cachedStatus = null;
}
