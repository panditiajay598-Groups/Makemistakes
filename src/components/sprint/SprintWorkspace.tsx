"use client";

import React, { useState, useEffect } from "react";
import SprintHeader from "./SprintHeader";
import SprintSidebarNav from "./SprintSidebarNav";
import SprintRightSidebar from "./SprintRightSidebar";
import SprintOverviewSection from "./SprintOverviewSection";
import SprintCurrentTaskSection from "./SprintCurrentTaskSection";
import SprintWorkspaceSection from "./SprintWorkspaceSection";
import SprintReviewSection from "./SprintReviewSection";
import SprintSubmitSection from "./SprintSubmitSection";
import SprintHistorySection from "./SprintHistorySection";
import SprintHelpDrawer from "./SprintHelpDrawer";

import KeyboardShortcutsModal from "@/components/workspace/KeyboardShortcutsModal";

export default function SprintWorkspace() {
  const [activeSection, setActiveSection] = useState<string>("current-task");
  const [sprintNumber, setSprintNumber] = useState<number>(2);
  const [sprintTitle, setSprintTitle] = useState<string>("Solution Design & Architecture");
  const [progressPercent, setProgressPercent] = useState<number>(25);

  const [completedSections, setCompletedSections] = useState<string[]>(["overview"]);
  const [lockedSections, setLockedSections] = useState<string[]>([]);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);

  // Keyboard listener: ⌘K opens Help Drawer, ? opens Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsHelpDrawerOpen(true);
      } else if (e.key === "?") {
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResumeSprint = () => {
    if (!completedSections.includes("overview")) {
      setCompletedSections((prev) => [...prev, "overview"]);
    }
    setActiveSection("current-task");
  };

  const handleStartBuilding = () => {
    if (!completedSections.includes("current-task")) {
      setCompletedSections((prev) => [...prev, "current-task"]);
    }
    setActiveSection("workspace");
  };

  const handleProceedToReview = () => {
    if (!completedSections.includes("workspace")) {
      setCompletedSections((prev) => [...prev, "workspace"]);
    }
    setActiveSection("review");
  };

  const handleProceedToSubmit = () => {
    if (!completedSections.includes("review")) {
      setCompletedSections((prev) => [...prev, "review"]);
    }
    setActiveSection("submit");
  };

  const handleSprintSubmitted = () => {
    if (!completedSections.includes("submit")) {
      setCompletedSections((prev) => [...prev, "submit"]);
    }
    setProgressPercent(100);
  };

  return (
    <div className="h-screen bg-[#FAF9F5] text-zinc-900 font-sans antialiased flex flex-col overflow-hidden select-none">
      {/* Top Sprint Header */}
      <SprintHeader
        sprintNumber={sprintNumber}
        sprintTitle={sprintTitle}
        activeSection={activeSection}
        progressPercent={progressPercent}
        onResume={handleResumeSprint}
        onOpenSearch={() => setIsHelpDrawerOpen(true)}
      />

      {/* Main 3-Column Execution Workflow Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Sidebar Navigation */}
        <SprintSidebarNav
          activeSection={activeSection}
          onSelectSection={(secId) => setActiveSection(secId)}
          onOpenHelpDrawer={() => setIsHelpDrawerOpen(true)}
          completedSections={completedSections}
          lockedSections={lockedSections}
        />

        {/* Center Execution Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAF9F5] min-w-0">
          {activeSection === "overview" && (
            <SprintOverviewSection
              sprintNumber={sprintNumber}
              sprintTitle={sprintTitle}
              progressPercent={progressPercent}
              currentTaskTitle="Design System Architecture"
              estimatedTime="45 Minutes Remaining"
              deadline="Today"
              onResume={handleResumeSprint}
            />
          )}

          {activeSection === "current-task" && (
            <SprintCurrentTaskSection
              onStartBuilding={handleStartBuilding}
              onOpenHelpDrawer={() => setIsHelpDrawerOpen(true)}
            />
          )}

          {activeSection === "workspace" && (
            <SprintWorkspaceSection sprintNumber={sprintNumber} />
          )}

          {activeSection === "review" && (
            <SprintReviewSection
              hasSubmitted={true}
              onProceedToShip={handleProceedToSubmit}
            />
          )}

          {activeSection === "submit" && (
            <SprintSubmitSection onSprintSubmitted={handleSprintSubmitted} />
          )}

          {activeSection === "history" && <SprintHistorySection />}
        </main>

        {/* Right Sidebar (Persistent) */}
        <SprintRightSidebar
          currentTaskTitle="Design System Architecture"
          estimatedTime="45 Minutes Remaining"
          deadline="Today"
          progressPercent={progressPercent}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenHelp={() => setIsHelpDrawerOpen(true)}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden border-t border-zinc-200 bg-white p-2 flex items-center justify-around font-mono text-[10px]">
        {[
          { id: "overview", label: "1. Overview" },
          { id: "current-task", label: "2. Task" },
          { id: "workspace", label: "3. Build" },
          { id: "review", label: "4. Review" },
          { id: "submit", label: "5. Submit" },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer border ${
              activeSection === sec.id
                ? "bg-teal-50 text-teal-900 border-teal-200"
                : "text-zinc-500 border-transparent"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Contextual Slide-Over Help Drawer */}
      <SprintHelpDrawer
        isOpen={isHelpDrawerOpen}
        onClose={() => setIsHelpDrawerOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
