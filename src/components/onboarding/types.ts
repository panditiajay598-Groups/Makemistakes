export interface OnboardingStepProps {
  onNext: (data?: any) => void;
}

export interface AIAssessmentScores {
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
}

export interface StepWhoAreYouProps {
  selectedRole?: string;
  onNext: (role: string) => void;
}

export interface StepExperienceProps {
  selectedExperience?: string;
  onNext: (experience: string) => void;
}

export interface StepGoalsProps {
  selectedGoals?: string[];
  onNext: (goals: string[]) => void;
}

export interface StepProductInterestsProps {
  selectedInterests?: string[];
  onNext: (interests: string[]) => void;
}

export interface StepTimeCommitmentProps {
  selectedTime?: string;
  onNext: (time: string) => void;
}

export interface StepAIAssessmentProps {
  onNext: (scores: AIAssessmentScores) => void;
}

export interface StepRoadmapGenProps {
  onNext: () => void;
}

export interface StepPersonalizedJourneyProps {
  userName?: string;
  selectedInterests?: string[];
  onNext: () => void;
}

export interface StepMissionOneProps {
  onCompleteMission: () => void;
}

export interface StepSprintOneProps {
  onCompleteSprint: () => void;
}

export interface CelebrationModalProps {
  isOpen: boolean;
  onContinue: () => void;
  promotionRank?: string;
  reputationEarned?: number;
  streakCount?: number;
}

// Legacy step interfaces for backward compatibility
export interface StepLearningPathProps {
  selectedPath?: string;
  onNext: (path: string) => void;
}

export interface StepDiscoveryProps {
  selectedLevel?: string;
  onNext: (startingLevel: string) => void;
}

export interface StepJourneyProps {
  selectedPath?: string;
  onNext: () => void;
}

export interface StepMissionZeroProps {
  onCompleteMission: () => void;
}

export interface LearningPathItem {
  id: string;
  title: string;
  iconEmoji: string;
  desc: string;
}
