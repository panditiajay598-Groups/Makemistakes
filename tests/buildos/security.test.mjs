import { test } from "node:test";
import assert from "node:assert/strict";

// The real guard from the BuildOS API layer (source is TypeScript; run with
// `node --experimental-strip-types --import ./tests/buildos/resolve-alias.loader.mjs`).
import { requireAuthenticatedOwner } from "../../src/lib/buildos/guard.ts";
import { signSessionToken } from "../../src/lib/authSession.ts";

const userA = { userId: "user-A", email: "a@example.com" };
const userB = { userId: "user-B", email: "b@example.com" };

function bearerRequest(user) {
  const token = signSessionToken({ userId: user.userId, email: user.email });
  return new Request("http://localhost/api/buildos/workspace", {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  });
}

function bareRequest() {
  return new Request("http://localhost/api/buildos/workspace", { method: "GET" });
}

function cookieRequest(user) {
  const token = signSessionToken({ userId: user.userId, email: user.email });
  return new Request("http://localhost/api/buildos/workspace", {
    method: "GET",
    headers: { cookie: `makemistakes_session=${token}` },
  });
}

test("no authentication -> 401", async () => {
  const result = await requireAuthenticatedOwner(bareRequest());
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
});

test("invalid session token -> 401", async () => {
  const req = new Request("http://localhost/api/buildos/workspace", {
    method: "GET",
    headers: { authorization: "Bearer not.a.valid.token" },
  });
  const result = await requireAuthenticatedOwner(req);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
});

test("malformed Authorization header value -> 401", async () => {
  const req = new Request("http://localhost/api/buildos/workspace", {
    method: "GET",
    headers: { authorization: "Basic dXNlcjpwYXNz" },
  });
  const result = await requireAuthenticatedOwner(req);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
});

test("authenticated owner accessing their own workspace -> allowed", async () => {
  const result = await requireAuthenticatedOwner(bearerRequest(userA), userA.userId);
  assert.equal(result.ok, true);
  // Authoritative identity comes from the session, not the client.
  assert.equal(result.session.userId, userA.userId);
});

test("authenticated owner accessing another user's workspace -> 403", async () => {
  const result = await requireAuthenticatedOwner(bearerRequest(userA), userB.userId);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});

test("client attempts to pass User B's userId while authenticated as A -> 403", async () => {
  // This is the "User A changes request userId to User B -> Blocked" case.
  const result = await requireAuthenticatedOwner(bearerRequest(userA), userB.userId);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});

test("session obtained from cookie (no Authorization header) -> allowed", async () => {
  const result = await requireAuthenticatedOwner(cookieRequest(userA), userA.userId);
  assert.equal(result.ok, true);
  assert.equal(result.session.userId, userA.userId);
});

test("cookie session cannot access another user's workspace -> 403", async () => {
  const result = await requireAuthenticatedOwner(cookieRequest(userA), userB.userId);
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});
