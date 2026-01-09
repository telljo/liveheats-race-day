import React from "react";
import { DEMO_RACES } from "../../stubs/DemoRace";
import RaceList from "./RaceList";

export default function RaceListPage() {
  return (
    <RaceList
      races={DEMO_RACES}
      onCreateRace={() => (window.location.href = `/races/new`)}
      onOpenRace={(id) => (window.location.href = `/races/${id}`)}
    />
  );
}
