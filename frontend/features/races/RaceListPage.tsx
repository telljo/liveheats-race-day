import React from "react";
import RaceList, { RaceSummary } from "./RaceList";

const DEMO_RACES: RaceSummary[] = [
  { id: "1", name: "Year 5 – Heat 1", status: "draft", laneCount: 4 },
  { id: "2", name: "Year 6 – Final", status: "completed", laneCount: 6 },
];

export default function RaceListPage() {
  return (
    <RaceList
      races={DEMO_RACES}
      onCreateRace={() => alert("Create race (next step)")}
      onOpenRace={(id) => (window.location.href = `/races/${id}`)}
    />
  );
}
