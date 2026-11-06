export function getSmtpCredentials(
  user: string | undefined,
  password: string | undefined
): { user: string; password: string } | null {
  return user && password ? { user, password } : null;
}
