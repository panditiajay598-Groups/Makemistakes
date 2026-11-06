export async function connectToConfiguredMongo<T>(
  uri: string | undefined,
  connect: (configuredUri: string) => Promise<T>
): Promise<T> {
  if (!uri?.trim()) {
    throw new Error("DATABASE_URL is not configured");
  }

  return connect(uri);
}
