import React from "react";
import Race from "./Race";
import { RaceSummary } from "./RaceList";

type Props = {
  raceId: string;
};

const DEMO_RACES: RaceSummary[] = [
  { id: "1", name: "Year 5 – Heat 1", status: "draft", laneCount: 4 },
  { id: "2", name: "Year 6 – Final", status: "completed", laneCount: 6 },
];

export default function RaceShowPage({ raceId }: Props) {
  const race = DEMO_RACES.find((r) => r.id === raceId);

  if (!race) {
    return (
      <div className="card">
        <h1 className="card__title">Race not found</h1>
        <p className="card__meta">Race ID: {raceId}</p>
        <div style={{ marginTop: "1rem" }}>
          <a href="/races">← Back to races</a>
        </div>
      </div>
    );
  }

  return (
    <Race
      race={race}
      onBack={() => (window.location.href = "/races")}
    />
  );
}
