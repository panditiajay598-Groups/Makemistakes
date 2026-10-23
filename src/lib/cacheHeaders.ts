import { NextResponse } from "next/server";

/**
 * MakeMistakes — Centralized HTTP Response Caching Policies
 *
 * Rules:
 * 1. Private / Security-Sensitive / User-Specific routes MUST use NO_STORE_CACHE_HEADERS
 *    to prevent CDNs, proxies, or shared browser caches from storing or cross-leaking data.
 * 2. Public / Non-Sensitive Catalog routes may use controlled caching headers.
 */

export const NO_STORE_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

export const PUBLIC_CATALOG_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
} as const;

export function applyNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", NO_STORE_CACHE_HEADERS["Cache-Control"]);
  response.headers.set("Pragma", NO_STORE_CACHE_HEADERS.Pragma);
  response.headers.set("Expires", NO_STORE_CACHE_HEADERS.Expires);
  return response;
}

export function applyPublicCatalogCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", PUBLIC_CATALOG_CACHE_HEADERS["Cache-Control"]);
  return response;
}
