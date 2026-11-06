/* eslint-disable @typescript-eslint/no-require-imports -- Shared CJS helper runs before Next.js loads. */
const dns = require("dns");

/**
 * @typedef {"system" | "custom_env" | "default_fallback"} DnsSource
 * @typedef {{ configured: boolean, disabled: boolean, servers: string[], source: DnsSource }} DnsConfigStatus
 */

/**
 * MakeMistakes Centralized DNS Configuration
 *
 * Local development falls back to public resolvers by default. Production preserves
 * platform DNS unless resolvers are explicitly configured.
 */

const DEFAULT_DNS_SERVERS = ["8.8.8.8", "1.1.1.1", "8.8.4.4"];
let cachedStatus = null;

function initDns() {
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

  const customEnvServers = process.env.DNS_SERVERS?.trim()
    ? process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
    : null;
  const shouldUseDefaultFallback =
    process.env.NODE_ENV !== "production" || process.env.DNS_FALLBACK === "true";
  const targetServers = customEnvServers?.length
    ? customEnvServers
    : shouldUseDefaultFallback
      ? DEFAULT_DNS_SERVERS
      : null;

  if (!targetServers) {
    globalThis.__dnsConfigured = true;
    cachedStatus = {
      configured: true,
      disabled: false,
      servers: dns.getServers(),
      source: "system",
    };
    return cachedStatus;
  }

  const expectedSource = customEnvServers?.length ? "custom_env" : "default_fallback";
  const currentServers = dns.getServers();
  const alreadyConfigured =
    globalThis.__dnsConfigured &&
    cachedStatus?.source === expectedSource &&
    currentServers.length === targetServers.length &&
    currentServers.every((server, index) => server === targetServers[index]);
  if (alreadyConfigured) return cachedStatus;

  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(targetServers);
    globalThis.__dnsConfigured = true;
    cachedStatus = {
      configured: true,
      disabled: false,
      servers: dns.getServers(),
      source: expectedSource,
    };
  } catch (error) {
    console.error("[dns] Could not apply the configured DNS resolvers; retaining system DNS.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
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
 * @returns {DnsConfigStatus}
 */
function getDnsStatus() {
  const status =
    cachedStatus ?? {
      configured: Boolean(globalThis.__dnsConfigured),
      disabled:
        process.env.DISABLE_CUSTOM_DNS === "true" ||
        process.env.DNS_FALLBACK === "false",
      servers: dns.getServers(),
      source: "system",
    };
  return { ...status, servers: dns.getServers() };
}

function _resetDnsForTesting() {
  globalThis.__dnsConfigured = false;
  cachedStatus = null;
}

module.exports = {
  DEFAULT_DNS_SERVERS,
  initDns,
  getDnsStatus,
  _resetDnsForTesting,
};
