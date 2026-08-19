"use client";

import React from "react";
import FeaturedMissionCard from "./FeaturedMissionCard";
import { Mission } from "./types";

interface FeaturedMissionProps {
  mission: Mission;
  onSelect: (mission: Mission) => void;
}

export default function FeaturedMission({ mission, onSelect }: FeaturedMissionProps) {
  return <FeaturedMissionCard mission={mission} onSelect={onSelect} />;
}
