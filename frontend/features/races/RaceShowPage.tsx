import React from "react";
import Race from "./Race";
import { useRace } from "../../hooks/useRaces"

type Props = {
  raceId: string;
};

export default function RaceShowPage({ raceId }: Props) {
  const { data, isLoading, isError, error } = useRace(+raceId);

  if (isLoading) return <div className="card">Loading…</div>;

  if (isError || !data) {
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
      race={data}
      onBack={() => (window.location.href = "/races")}
    />
  );
}