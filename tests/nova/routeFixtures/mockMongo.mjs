export async function getDb() {
  const db = globalThis.__novaChatRouteTestDb;
  if (!db) throw new Error("Nova route test database fixture is not configured");
  return db;
}
