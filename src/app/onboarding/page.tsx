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
  resetOnboardingForNewUser,
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
    let activeProf = getOnboardingProfile();

    // Check if user requested a fresh onboarding reset via URL query parameter (e.g. ?reset=true or ?step=1)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isReset = urlParams.get("reset") === "true" || urlParams.get("restart") === "true";
      const forceStep = urlParams.get("step");

      if (isReset) {
        activeProf = resetOnboardingForNewUser();
        setProfile(activeProf);
        setCurrentStage(1);
        return;
      }

      if (forceStep && !isNaN(parseInt(forceStep, 10))) {
        const stepNum = parseInt(forceStep, 10);
        if (stepNum >= 1 && stepNum <= 5) {
          activeProf = saveOnboardingProfile({ onboardingStep: stepNum, onboardingCompleted: false });
          setProfile(activeProf);
          setCurrentStage(stepNum);
          return;
        }
      }
    }

    setProfile(activeProf);

    // If onboarding is already fully complete, redirect to dashboard
    if (activeProf?.onboardingCompleted) {
      router.push("/dashboard");
    } else if (activeProf?.onboardingStep && activeProf.onboardingStep >= 1 && activeProf.onboardingStep <= 5) {
      setCurrentStage(activeProf.onboardingStep);
    }
  }, [router]);

  // Listen for browser Back/Forward navigation (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStep = urlParams.get("step");
      if (urlStep && !isNaN(parseInt(urlStep, 10))) {
        const parsed = parseInt(urlStep, 10);
        if (parsed >= 1 && parsed <= 5) {
          setCurrentStage(parsed);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Update URL search parameter & browser history stack when currentStage changes
  useEffect(() => {
    if (typeof window !== "undefined" && currentStage >= 1 && currentStage <= 5) {
      const url = new URL(window.location.href);
      const currentUrlStep = url.searchParams.get("step");
      if (currentUrlStep !== String(currentStage)) {
        url.searchParams.set("step", String(currentStage));
        window.history.pushState({ step: currentStage }, "", url.toString());
      }
    }
  }, [currentStage]);

  // Stage 1 -> Stage 2: Welcome -> Developer Identity
  const handleNextFromWelcome = () => {
    const updated = saveOnboardingProfile({ welcomeCompleted: true, onboardingStep: 2 });
    setProfile(updated);
    setCurrentStage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 2 -> Stage 3: Developer Identity -> Choose First Product
  const handleCompleteDeveloperIdentity = (identity: DeveloperIdentityResponses) => {
    const updated = saveOnboardingProfile({
      developerIdentityCompleted: true,
      onboardingStep: 3,
      onboardingAnswers: {
        ...(profile?.onboardingAnswers || {}),
        developerIdentity: identity,
      },
      whoAreYouRole: identity.futureVision || profile?.whoAreYouRole,
      productExperience: identity.learningStyle || profile?.productExperience,
      selectedGoal: identity.successDefinition || profile?.selectedGoal,
      selectedPath: identity.engineeringPersonality || profile?.selectedPath,
    });
    setProfile(updated);
    setCurrentStage(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 3 -> Stage 4: Choose First Product -> Mission Zero (Builder Assessment)
  const handleSelectProduct = (product: FirstProductOption) => {
    const updated = saveOnboardingProfile({
      productSelected: true,
      onboardingStep: 4,
      currentProduct: product.title,
      assignedProductTrack: `${product.title} Track`,
    });
    setProfile(updated);
    setCurrentStage(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stage 4 -> Stage 5: Mission Zero -> Transition Screen (Generating Your Personalized Journey)
  const handleCompleteAssessment = (metrics: BuilderProfileMetrics) => {
    const updated = saveOnboardingProfile({
      missionZeroCompleted: true,
      onboardingStep: 5,
    });
    setProfile(updated);
    setAssessmentMetrics(metrics);
    setCurrentStage(5);
  };

  // Stage 5 -> /dashboard: Transition Screen Completed -> BuildOS Dashboard
  const handleFinishTransition = () => {
    saveOnboardingProfile({
      onboardingCompleted: true,
      foundingJourneyCompleted: true,
    });
    router.push("/dashboard");
  };

  // Navigation Back Handlers
  const handleBackToStep = (targetStep: number) => {
    const updated = saveOnboardingProfile({ onboardingStep: targetStep });
    setProfile(updated);
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
