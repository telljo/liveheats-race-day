import React from "react";
import RaceList from "./RaceList";

export default function RaceListPage() {

  return (
    <RaceList
      onCreateRace={() => (window.location.href = `/races/new`)}
      onViewStudents={() => (window.location.href = `/students`)}
      onOpenRace={(id) => (window.location.href = `/races/${id}`)}
    />
  );
}
