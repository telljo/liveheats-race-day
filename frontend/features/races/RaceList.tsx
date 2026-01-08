import React from "react";
import Button from "../../components/Button";

export type RaceSummary = {
  id: string;
  name: string;
  status: "draft" | "completed";
  laneCount: number;
};

type Props = {
  races: RaceSummary[];
  onCreateRace: () => void;
  onOpenRace: (raceId: string) => void;
};

export default function RaceList({ races, onCreateRace, onOpenRace }: Props) {
  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>Races</h1>
        <Button variant="primary" size="md" onClick={onCreateRace}>
          + New race
        </Button>
      </div>

      {races.length === 0 ? (
        <div className="card">
          <h2 className="card__title">No races yet</h2>
          <p className="card__meta">
            Create a race, assign students to lanes, then record results.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Button variant="primary" size="md" onClick={onCreateRace}>
              Create your first race
            </Button>
          </div>
        </div>
      ) : (
        <div className="stack stack--sm">
          {races.map((race) => (
            <button
              key={race.id}
              className="race-list-item"
              type="button"
              onClick={() => onOpenRace(race.id)}
            >
              <div className="race-list-item__main">
                <div className="race-list-item__title">{race.name}</div>
                <div className="race-list-item__meta">
                  {race.laneCount} lanes • {race.status === "completed" ? "Completed" : "Draft"}
                </div>
              </div>

              <span className="race-list-item__chevron">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}