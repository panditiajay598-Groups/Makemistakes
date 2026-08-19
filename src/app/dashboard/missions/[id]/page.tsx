"use client";

import React from "react";
import { useParams } from "next/navigation";
import MissionEngine from "@/components/mission-engine/MissionEngine";

export default function DashboardMissionPage() {
  const params = useParams();
  const id = (params?.id as string) || "mission-1";

  return <MissionEngine missionId={id} />;
}
