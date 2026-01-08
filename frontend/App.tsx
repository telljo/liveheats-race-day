// frontend/src/App.tsx
import React from "react";
import Header from "./components/Header";
import RaceList, { RaceSummary } from "./features/races/RaceList";

const DEMO_RACES: RaceSummary[] = [
  { id: "1", name: "Year 5 – Heat 1", status: "draft", laneCount: 4 },
  { id: "2", name: "Year 6 – Final", status: "completed", laneCount: 6 },
];

export default function App() {
  const races = DEMO_RACES; // Replace with real data fetching logic

  return (
    <>
      <Header />

      <main className="page">
        <div className="container">
          <RaceList
            races={races}
            onCreateRace={() => alert("Create race (next step)")}
            onOpenRace={(id) => alert(`Open race ${id} (next step)`)}
          />
        </div>
      </main>
    </>
  );
}
