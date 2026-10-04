export interface DailyStandupData {
  yesterday: string;
  today: string;
  blocked: string;
  focusTime: string;
}

export interface UserOnboardingProfile {
  onboardingStep?: number;
  onboardingAnswers?: Record<string, any>;
  onboardingCompleted: boolean;
  foundingJourneyCompleted: boolean;
  welcomeCompleted?: boolean;
  developerIdentityCompleted?: boolean;
  productSelected?: boolean;
  blueprintCompleted?: boolean;
  missionZeroCompleted?: boolean;
  missionControlInitialized?: boolean;
  mission0Completed: boolean;
  mission1Completed: boolean;
  sprint1Completed: boolean;

  whoAreYouRole: string;
  productExperience: string;
  selectedGoals: string[];
  productInterests: string[];
  timeCommitment: string;

  promotionRank: string;
  engineeringReputation: number;
  problemsValidated: number;
  customerInterviews: number;
  solutionsDesigned: number;
  featuresBuilt: number;
  featuresShipped: number;
  deployments: number;
  missionStreak: number;

  currentSprintId: string;
  currentSprintTitle: string;
  nextSprintTitle: string;
  currentTask: string;
  currentProduct: string;
  dailyStandup: DailyStandupData;

  assessmentScores: {
    problemSolving: number;
    debugging: number;
    frontend: number;
    backend: number;
    databases: number;
    apiDesign: number;
    systemThinking: number;
    communication: number;
    criticalThinking?: number;
    productThinking?: number;
    decisionMaking?: number;
  };
  assignedProductTrack: string;
  selectedGoal: string;
  selectedPath: string;
  startingLevel: string;
  experienceLevel: string;
  recommendedTrack: string;
  startingMissionId: string;
  startingMissionTitle: string;
  currentMissionId: string | null;
  completedMissionsCount: number;
  totalMissionsCount: number;
  xp: number;
  badges: string[];
  completedAt?: string;
}

const STORAGE_KEY = "makemistakes_user_onboarding";

const DEFAULT_PROFILE: UserOnboardingProfile = {
  onboardingStep: 1,
  onboardingAnswers: {},
  onboardingCompleted: false,
  foundingJourneyCompleted: false,
  mission0Completed: false,
  mission1Completed: false,
  sprint1Completed: false,

  whoAreYouRole: "College Student",
  productExperience: "I've built a few college projects.",
  selectedGoals: ["Get my first software job", "Build products people actually use"],
  productInterests: ["AI SaaS", "Developer Tools", "Productivity"],
  timeCommitment: "10–20 Hours",

  promotionRank: "Associate Product Engineer",
  engineeringReputation: 150,
  problemsValidated: 1,
  customerInterviews: 2,
  solutionsDesigned: 0,
  featuresBuilt: 0,
  featuresShipped: 0,
  deployments: 0,
  missionStreak: 1,

  currentSprintId: "sprint-2",
  currentSprintTitle: "Sprint 2: Solution Design",
  nextSprintTitle: "Sprint 3: Build MVP",
  currentTask: "Design the first version of the solution",
  currentProduct: "MakeMistakes Learning Platform",

  dailyStandup: {
    yesterday: "Validated the customer problem in Sprint 1",
    today: "Design the first solution & wireframes for MakeMistakes",
    blocked: "No blockers detected",
    focusTime: "30 Minutes",
  },

  assessmentScores: {
    problemSolving: 85,
    debugging: 78,
    frontend: 80,
    backend: 82,
    databases: 75,
    apiDesign: 88,
    systemThinking: 84,
    communication: 90,
    criticalThinking: 86,
    productThinking: 89,
    decisionMaking: 87,
  },
  assignedProductTrack: "MakeMistakes Product Engineering",
  selectedGoal: "🚀 Get a Software Job",
  selectedPath: "🤖 AI Engineering",
  startingLevel: "Founding Engineer Candidate",
  experienceLevel: "Intermediate",
  recommendedTrack: "Full-Stack Product Engineering & AI",
  startingMissionId: "sprint-1",
  startingMissionTitle: "Sprint 1: Problem Discovery",
  currentMissionId: null,
  completedMissionsCount: 1,
  totalMissionsCount: 8,
  xp: 150,
  badges: ["Founding Candidate", "Associate Product Engineer"],
};

export function getOnboardingProfile(): UserOnboardingProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  try {
    const email = localStorage.getItem("user_email")?.trim().toLowerCase();
    let emailData: any = null;
    let isEmailCompleted = false;

    if (email) {
      const emailStorageKey = `${STORAGE_KEY}_${email}`;
      const rawEmailData = localStorage.getItem(emailStorageKey);
      if (rawEmailData) {
        emailData = JSON.parse(rawEmailData);
      }
      if (localStorage.getItem(`user_onboarding_completed_${email}`) === "true") {
        isEmailCompleted = true;
      }
    }

    const globalDataRaw = localStorage.getItem(STORAGE_KEY);
    const globalData = globalDataRaw ? JSON.parse(globalDataRaw) : {};

    const merged = {
      ...DEFAULT_PROFILE,
      ...globalData,
      ...(emailData || {}),
    };

    if (isEmailCompleted || emailData?.onboardingCompleted) {
      merged.onboardingCompleted = true;
      merged.foundingJourneyCompleted = true;
    }

    return {
      ...merged,
      assessmentScores: {
        ...DEFAULT_PROFILE.assessmentScores,
        ...(merged.assessmentScores || {}),
      },
      dailyStandup: {
        ...DEFAULT_PROFILE.dailyStandup,
        ...(merged.dailyStandup || {}),
      },
    };
  } catch (e) {
    console.warn("Could not read onboarding profile from localStorage", e);
  }

  return DEFAULT_PROFILE;
}

export function saveOnboardingProfile(profile: Partial<UserOnboardingProfile>): UserOnboardingProfile {
  const current = getOnboardingProfile();
  const updated: UserOnboardingProfile = {
    ...current,
    ...profile,
    ...(profile.assessmentScores
      ? {
          assessmentScores: {
            ...current.assessmentScores,
            ...profile.assessmentScores,
          },
        }
      : {}),
    ...(profile.dailyStandup
      ? {
          dailyStandup: {
            ...current.dailyStandup,
            ...profile.dailyStandup,
          },
        }
      : {}),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const email = localStorage.getItem("user_email")?.trim().toLowerCase();
      if (email) {
        localStorage.setItem(`${STORAGE_KEY}_${email}`, JSON.stringify(updated));
        if (updated.onboardingCompleted) {
          localStorage.setItem(`user_onboarding_completed_${email}`, "true");
        }
      }
    } catch (e) {
      console.warn("Failed to write onboarding profile to localStorage", e);
    }
  }

  return updated;
}

export async function syncUserOnboardingWithBackend(userEmail?: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const email = userEmail || localStorage.getItem("user_email");
  if (!email) return false;

  const cleanEmail = email.trim().toLowerCase();

  // Check local per-user cache first
  if (localStorage.getItem(`user_onboarding_completed_${cleanEmail}`) === "true") {
    saveOnboardingProfile({ onboardingCompleted: true, foundingJourneyCompleted: true });
    return true;
  }

  try {
    const res = await fetch(`/api/journey/active?userId=${encodeURIComponent(cleanEmail)}`);
    if (res.ok) {
      const data = await res.json();
      // If user has an active/unfinished problem OR completed any problem in DB
      if (data.problemId || data.isUnfinished || data.status === "in_progress") {
        saveOnboardingProfile({ onboardingCompleted: true, foundingJourneyCompleted: true });
        localStorage.setItem(`user_onboarding_completed_${cleanEmail}`, "true");
        return true;
      }
    }
  } catch (e) {
    console.warn("Error syncing user onboarding status:", e);
  }

  return false;
}

export function completeOnboardingSteps(profile: Partial<UserOnboardingProfile>): UserOnboardingProfile {
  return saveOnboardingProfile({
    ...profile,
    onboardingCompleted: true,
    foundingJourneyCompleted: true,
  });
}

export function completeSprintOne(
  reputationEarned: number = 150,
  newRank: string = "Associate Product Engineer"
): UserOnboardingProfile {
  const current = getOnboardingProfile();
  const existingBadges = current.badges || [];
  const updatedBadges = existingBadges.includes(newRank) ? existingBadges : [...existingBadges, newRank];

  return saveOnboardingProfile({
    onboardingCompleted: true,
    foundingJourneyCompleted: true,
    mission0Completed: true,
    mission1Completed: true,
    sprint1Completed: true,
    promotionRank: newRank,
    engineeringReputation: (current.engineeringReputation || 0) + reputationEarned,
    problemsValidated: Math.max(current.problemsValidated || 0, 1),
    customerInterviews: Math.max(current.customerInterviews || 0, 2),
    completedMissionsCount: Math.max(current.completedMissionsCount || 0, 1),
    xp: (current.xp || 0) + reputationEarned,
    badges: updatedBadges,
    completedAt: new Date().toISOString(),
  });
}

export function completeMissionOne(
  xpEarned: number = 150,
  badgeEarned: string = "Associate Product Engineer"
): UserOnboardingProfile {
  return completeSprintOne(xpEarned, badgeEarned);
}

export function completeMissionZero(
  xpEarned: number = 100,
  badgeEarned: string = "First Mistake"
): UserOnboardingProfile {
  return completeSprintOne(xpEarned, badgeEarned);
}

export function resetOnboardingForNewUser(): UserOnboardingProfile {
  if (typeof window !== "undefined") {
    try {
      const email = localStorage.getItem("user_email")?.trim().toLowerCase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      if (email) {
        localStorage.removeItem(`user_onboarding_completed_${email}`);
        localStorage.removeItem(`${STORAGE_KEY}_${email}`);
      }
      localStorage.removeItem("makemistakes_active_mission_session");
    } catch (e) {
      console.warn("Failed to reset onboarding profile in localStorage", e);
    }
  }

  return DEFAULT_PROFILE;
}

