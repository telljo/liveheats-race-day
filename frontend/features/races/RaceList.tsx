import React from "react";
import Button from "../../components/Button";
import { useRaces } from "../../hooks/useRaces"

type Props = {
  onCreateRace: () => void;
  onOpenRace: (raceId: number) => void;
};

export default function RaceList({onCreateRace, onOpenRace }: Props) {
  const { data, isLoading, isError, error } = useRaces();

  if (isLoading) return <div className="card">Loading…</div>;

  console.log(data);
  console.log(data);

  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>Races</h1>
        <Button variant="primary" size="md" onClick={onCreateRace}>
          + New race
        </Button>
      </div>

      {data?.length === 0 ? (
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
          {data?.map((race) => (
            <button
              key={race.id}
              className="race-list-item"
              type="button"
              onClick={() => onOpenRace(race.id)}
            >
              <div className="race-list-item__main">
                <div className="race-list-item__title">{race.name}</div>
                <div className="race-list-item__meta">
                  {race.status === "completed" ? "Completed" : "Draft"}
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