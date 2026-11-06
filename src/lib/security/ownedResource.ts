export async function findOwnedResource<T extends { userId: string }>(
  userIds: string[],
  loadForUser: (userId: string) => Promise<T | null>
): Promise<{ userId: string; resource: T } | null> {
  for (const userId of userIds) {
    const resource = await loadForUser(userId);
    if (resource?.userId === userId) {
      return { userId, resource };
    }
  }

  return null;
}
