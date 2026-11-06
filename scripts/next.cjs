/* eslint-disable @typescript-eslint/no-require-imports -- This CJS entrypoint preloads DNS before Next.js. */
const { initDns } = require("../src/lib/dns.js");

const [command, ...args] = process.argv.slice(2);
if (!command) {
  throw new Error("A Next.js command is required.");
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = command === "dev" ? "development" : "production";
}

initDns();

// Configure DNS before loading Next.js or any bundled MongoDB driver code.
const nextCli = require.resolve("next/dist/bin/next");
process.argv = [process.execPath, nextCli, command, ...args];
require(nextCli);
