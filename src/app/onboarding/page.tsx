"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingHeader,
  StepWelcome,
  DeveloperIdentityFlow,
  ChooseYourFirstProduct,
  BuilderAssessment,
  GeneratingJourneyTransition,
} from "@/components/onboarding";
import {
  saveOnboardingProfile,
  getOnboardingProfile,
  UserOnboardingProfile,
} from "@/lib/onboardingStore";
import { DeveloperIdentityResponses } from "@/components/onboarding/DeveloperIdentityFlow";
import { FirstProductOption } from "@/components/onboarding/ChooseYourFirstProduct";
import { BuilderProfileMetrics } from "@/components/onboarding/BuilderAssessment";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(1);
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [assessmentMetrics, setAssessmentMetrics] = useState<BuilderProfileMetrics | null>(null);

  // Load existing profile state
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);

    // If onboarding is already fully complete, redirect to dashboard
    if (activeProf?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [router]);

  // Stage 1 -> Stage 2: Welcome -> Developer Identity
  const handleNextFromWelcome = () => {
    saveOnboardingProfile({ welcomeCompleted: true });
    setCurrentStage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 2 -> Stage 3: Developer Identity -> Choose First Product
  const handleCompleteDeveloperIdentity = (identity: DeveloperIdentityResponses) => {
    const updated = saveOnboardingProfile({
      developerIdentityCompleted: true,
      whoAreYouRole: identity.futureVision,
      productExperience: identity.learningStyle,
      selectedGoal: identity.successDefinition,
      selectedPath: identity.engineeringPersonality,
    });
    setProfile(updated);
    setCurrentStage(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 3 -> Stage 4: Choose First Product -> Mission Zero (Builder Assessment)
  const handleSelectProduct = (product: FirstProductOption) => {
    const updated = saveOnboardingProfile({
      productSelected: true,
      currentProduct: product.title,
      assignedProductTrack: `${product.title} Track`,
    });
    setProfile(updated);
    setCurrentStage(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 4 -> Stage 5: Mission Zero -> Transition Screen (Generating Your Personalized Journey)
  const handleCompleteAssessment = (metrics: BuilderProfileMetrics) => {
    setAssessmentMetrics(metrics);
    setCurrentStage(5);
  };

  // Stage 5 -> /dashboard: Transition Screen Completed -> BuildOS Dashboard
  const handleFinishTransition = () => {
    router.push("/dashboard");
  };

  // Navigation Back Handlers
  const handleBackToStep = (targetStep: number) => {
    setCurrentStage(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 flex flex-col font-sans antialiased selection:bg-teal-700 selection:text-white">
      {/* Dynamic Header (hidden during fullscreen Stage 5 transition) */}
      {currentStage < 5 && (
        <OnboardingHeader
          currentStep={currentStage}
          totalSteps={4}
          onBack={
            currentStage > 1
              ? () => handleBackToStep(currentStage - 1)
              : undefined
          }
        />
      )}

      {/* Main Screen Container */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-10 my-auto">
        <div className="w-full max-w-5xl py-4">
          {/* Stage 1: Welcome to MakeMistakes */}
          {currentStage === 1 && <StepWelcome onNext={handleNextFromWelcome} />}

          {/* Stage 2: Developer Identity (6-step identity discovery) */}
          {currentStage === 2 && (
            <DeveloperIdentityFlow
              onComplete={handleCompleteDeveloperIdentity}
              onBackToWelcome={() => handleBackToStep(1)}
            />
          )}

          {/* Stage 3: Choose Your First Product */}
          {currentStage === 3 && (
            <ChooseYourFirstProduct
              onSelectProduct={handleSelectProduct}
              onBackToDestination={() => handleBackToStep(2)}
            />
          )}

          {/* Stage 4: Mission Zero (Builder Assessment - 8 Interactive Scenarios) */}
          {currentStage === 4 && (
            <BuilderAssessment
              onCompleteAssessment={handleCompleteAssessment}
              onBackToProduct={() => handleBackToStep(3)}
            />
          )}

          {/* Stage 5: Generating Your Personalized Journey (Transition Screen) */}
          {currentStage === 5 && (
            <GeneratingJourneyTransition
              assessmentMetrics={assessmentMetrics}
              onFinishTransition={handleFinishTransition}
            />
          )}
        </div>
      </main>
    </div>
  );
}
