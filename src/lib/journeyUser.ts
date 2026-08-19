/**
 * Stable journey user id for problem-completion progress.
 * Prefers authenticated email; otherwise a persistent anonymous id.
 */
export function getJourneyUserId(): string {
  if (typeof window === "undefined") return "default_user";

  try {
    const email = localStorage.getItem("user_email");
    if (email && email.trim()) {
      return email.trim().toLowerCase();
    }

    const KEY = "makemistakes_journey_user_id";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `anon_${crypto.randomUUID()}`
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "default_user";
  }
}
