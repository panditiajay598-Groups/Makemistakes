"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getMissionById, MissionData } from "./missionsData";
import {
  getMissionState,
  saveMissionState,
  evaluateSubmissionWithNova,
  syncMissionCompletionToOnboarding,
  syncJourneyMissionCompletion,
  MissionState,
} from "@/lib/missionStore";
import MissionHeader from "./MissionHeader";
import MissionBrief from "./MissionBrief";
import MissionWorkspace from "./MissionWorkspace";
import NovaReview from "./NovaReview";
import MissionCompletion from "./MissionCompletion";
import { Bot, Sparkles, Cpu, Loader2 } from "lucide-react";

interface MissionEngineProps {
  missionId: string;
}

export default function MissionEngine({ missionId }: MissionEngineProps) {
  const router = useRouter();
  const [mission, setMission] = useState<MissionData>(() => getMissionById(missionId));
  const [state, setState] = useState<MissionState>(() => getMissionState(missionId));

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [submittingStepText, setSubmittingStepText] = useState("Submitting your solution...");

  useEffect(() => {
    const loaded = getMissionById(missionId);
    setMission(loaded);
    const mState = getMissionState(missionId);
    setState(mState);
  }, [missionId]);

  // Handle draft auto-saving
  const handleDraftChange = (deliverableId: string, content: string) => {
    setSaveStatus("saving");
    const updatedDrafts = { ...state.drafts, [deliverableId]: content };
    const newState = { ...state, drafts: updatedDrafts };
    setState(newState);
    saveMissionState(newState);
    setTimeout(() => setSaveStatus("saved"), 400);
  };

  const handleResearchNotesChange = (notes: string) => {
    setSaveStatus("saving");
    const newState = { ...state, researchNotes: notes };
    setState(newState);
    saveMissionState(newState);
    setTimeout(() => setSaveStatus("saved"), 400);
  };

  const handleUnlockHint = (hintId: string) => {
    if (!state.unlockedHintIds.includes(hintId)) {
      const updated = [...state.unlockedHintIds, hintId];
      const newState = { ...state, unlockedHintIds: updated };
      setState(newState);
      saveMissionState(newState);
    }
  };

  const handleStartWorking = () => {
    const newState: MissionState = { ...state, step: "WORKSPACE" };
    setState(newState);
    saveMissionState(newState);
  };

  // Step 4: Premium loading sequence (~2 seconds)
  const handleSubmitSolution = () => {
    const newState: MissionState = { ...state, step: "SUBMITTING" };
    setState(newState);
    saveMissionState(newState);

    setSubmittingStepText("Submitting your solution...");

    setTimeout(() => {
      setSubmittingStepText("Analyzing your engineering decisions...");
    }, 750);

    setTimeout(() => {
      setSubmittingStepText("Preparing Nova's feedback...");
    }, 1400);

    setTimeout(() => {
      // Evaluate submission
      const evaluation = evaluateSubmissionWithNova(mission.id, state.drafts, state.iteration);
      const evalState: MissionState = {
        ...state,
        step: "REVIEW",
        evaluations: [...state.evaluations, evaluation],
      };
      setState(evalState);
      saveMissionState(evalState);
    }, 2100);
  };

  // Step 6: Improve & Resubmit
  const handleImproveSubmission = () => {
    const newState: MissionState = {
      ...state,
      step: "WORKSPACE",
      iteration: state.iteration + 1,
    };
    setState(newState);
    saveMissionState(newState);
  };

  // Step 7: Complete Mission
  const handleCompleteMission = () => {
    // Sync to legacy onboarding store (preserved for backwards compat)
    syncMissionCompletionToOnboarding(
      mission.id,
      mission.title,
      mission.xpReward,
      mission.nextMissionId
    );
    // Sync to new Product Journey architecture
    syncJourneyMissionCompletion(mission.id);

    const newState: MissionState = {
      ...state,
      step: "COMPLETED",
      completedAt: new Date().toISOString(),
    };
    setState(newState);
    saveMissionState(newState);
  };

  const handleContinueNextMission = () => {
    router.push(`/dashboard/missions/${mission.nextMissionId}`);
  };

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  const currentEval = state.evaluations[state.evaluations.length - 1];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col overflow-x-hidden">
      
      {/* Top Header Navigation */}
      <MissionHeader
        mission={mission}
        currentStep={state.step}
        saveStatus={saveStatus}
        isSummaryOpen={isSummaryOpen}
        onToggleSummary={() => setIsSummaryOpen(!isSummaryOpen)}
        onStepClick={(targetStep) => {
          const newState: MissionState = { ...state, step: targetStep };
          setState(newState);
          saveMissionState(newState);
        }}
      />

      {/* Main Animated Step Content Container */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 2: MISSION BRIEF */}
          {state.step === "BRIEF" && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <MissionBrief mission={mission} onStartWorking={handleStartWorking} />
            </motion.div>
          )}

          {/* STEP 3: MISSION WORKSPACE */}
          {state.step === "WORKSPACE" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <MissionWorkspace
                mission={mission}
                drafts={state.drafts}
                researchNotes={state.researchNotes}
                unlockedHintIds={state.unlockedHintIds}
                saveStatus={saveStatus}
                isSummaryOpen={isSummaryOpen}
                onToggleSummary={() => setIsSummaryOpen(!isSummaryOpen)}
                onChangeDraft={handleDraftChange}
                onChangeResearchNotes={handleResearchNotesChange}
                onUnlockHint={handleUnlockHint}
                onSaveDraft={() => setSaveStatus("saved")}
                onSubmitSolution={handleSubmitSolution}
              />
            </motion.div>
          )}

          {/* STEP 4: SUBMITTING PREMIUM LOADING EXPERIENCE */}
          {state.step === "SUBMITTING" && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-center min-h-[500px] p-6 text-center"
            >
              <div className="max-w-md w-full bg-white border border-teal-200 p-8 sm:p-10 rounded-3xl space-y-6 shadow-2xl shadow-zinc-200/50">
                <div className="relative flex justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-mono font-bold text-xl shadow-lg shadow-teal-700/30 animate-bounce">
                    Nova
                  </div>
                  <Sparkles className="h-6 w-6 text-amber-500 absolute -top-2 -right-2 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-zinc-900">
                    Evaluating Submission
                  </h3>
                  <p className="font-mono text-xs text-teal-800 font-semibold transition-all duration-300">
                    {submittingStepText}
                  </p>
                </div>

                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200">
                  <div className="bg-teal-700 h-full rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5 & 6: NOVA REVIEW */}
          {state.step === "REVIEW" && currentEval && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <NovaReview
                mission={mission}
                evaluation={currentEval}
                onImproveSubmission={handleImproveSubmission}
                onCompleteMission={handleCompleteMission}
              />
            </motion.div>
          )}

          {/* STEP 7: MISSION COMPLETE */}
          {state.step === "COMPLETED" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <MissionCompletion
                mission={mission}
                onContinueNextMission={handleContinueNextMission}
                onReturnToDashboard={handleReturnToDashboard}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
