"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StepAICodeReview from "./StepAICodeReview";
import AssessmentModeContainer, { TabSwitchLog } from "./AssessmentModeContainer";
import DynamicQuestionEngine, { AnswerPayload } from "./DynamicQuestionEngine";
import ConfidenceCheck, { ConfidencePayload } from "./ConfidenceCheck";
import AIEvaluationScorecard, { EvaluationScore } from "./AIEvaluationScorecard";
import SocraticDebugger from "./SocraticDebugger";

interface VerificationModalProps {
  isOpen: boolean;
  code: string;
  activeFile: string;
  stepTitle: string;
  onClose: () => void;
  onSuccessComplete: () => void;
}

export default function VerificationModal({
  isOpen,
  code,
  activeFile,
  stepTitle,
  onClose,
  onSuccessComplete,
}: VerificationModalProps) {
  const [modalStage, setModalStage] = useState<
    "ai_review" | "assessment_start" | "questions" | "confidence" | "scorecard" | "test_debug"
  >("ai_review");

  // Collected Proof of Work Data
  const [tabSwitchLogs, setTabSwitchLogs] = useState<TabSwitchLog[]>([]);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [confidence, setConfidence] = useState<ConfidencePayload | null>(null);
  const [evaluationScores, setEvaluationScores] = useState<EvaluationScore | null>(null);

  if (!isOpen) return null;

  const handleLogSwitch = (log: TabSwitchLog) => {
    setTabSwitchLogs((prev) => [...prev, log]);
  };

  const handleFinishAll = () => {
    // Persist complete Proof of Work record to localStorage
    const powRecord = {
      timestamp: new Date().toISOString(),
      activeFile,
      stepTitle,
      code,
      answers,
      confidence,
      evaluationScores,
      tabSwitchLogs,
      verified: true,
    };

    try {
      const existing = localStorage.getItem("makemistakes_proof_of_work");
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem("makemistakes_proof_of_work", JSON.stringify([...parsed, powRecord]));
    } catch (e) {
      console.warn("Failed to store Proof of Work record", e);
    }

    onSuccessComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              MAKE MISTAKES PR REVIEW
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              File: {activeFile}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all no-underline shrink-0"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-zinc-100" />
            </Link>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer border-none font-mono text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {modalStage === "ai_review" && (
            <StepAICodeReview
              code={code}
              fileName={activeFile}
              stepTitle={stepTitle}
              onContinue={() => setModalStage("assessment_start")}
            />
          )}

          {(modalStage === "assessment_start" || modalStage === "questions") && (
            <AssessmentModeContainer
              onBeginQuestions={() => setModalStage("questions")}
              onLogSwitch={handleLogSwitch}
            >
              {modalStage === "questions" && (
                <DynamicQuestionEngine
                  code={code}
                  onQuestionsCompleted={(submittedAnswers) => {
                    setAnswers(submittedAnswers);
                    setModalStage("confidence");
                  }}
                />
              )}
            </AssessmentModeContainer>
          )}

          {modalStage === "confidence" && (
            <ConfidenceCheck
              onConfidenceSubmitted={(payload) => {
                setConfidence(payload);
                setModalStage("scorecard");
              }}
            />
          )}

          {modalStage === "scorecard" && (
            <AIEvaluationScorecard
              answers={answers}
              confidence={confidence}
              onRunVerification={(scores) => {
                setEvaluationScores(scores);
                setModalStage("test_debug");
              }}
            />
          )}

          {modalStage === "test_debug" && (
            <SocraticDebugger onCompleteVerification={handleFinishAll} />
          )}
        </div>

      </div>
    </div>
  );
}
