/**
 * Stable journey user id for problem-completion progress.
 * Prefers authenticated email; otherwise a persistent anonymous id.
 * Eliminates redundant localStorage reads on every component render.
 */

let cachedJourneyUserId: string | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key === "user_email" || e.key === "makemistakes_journey_user_id") {
      cachedJourneyUserId = null;
    }
  });
}

export function clearJourneyUserIdCache(): void {
  cachedJourneyUserId = null;
}

export function getJourneyUserId(): string {
  if (typeof window === "undefined") return "default_user";

  if (cachedJourneyUserId) {
    return cachedJourneyUserId;
  }

  try {
    const email = localStorage.getItem("user_email");
    if (email && email.trim()) {
      cachedJourneyUserId = email.trim().toLowerCase();
      return cachedJourneyUserId;
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
    cachedJourneyUserId = id;
    return cachedJourneyUserId;
  } catch {
    return "default_user";
  }
}
