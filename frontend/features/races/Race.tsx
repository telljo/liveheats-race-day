import React from "react";
import { RaceSummary } from "./RaceList";
import Button from "../../components/Button";

type Props = {
  race: RaceSummary;
  onBack: () => void;
};

export default function Race({ race, onBack }: Props) {
  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>{race.name}</h1>
        <Button variant="primary" size="md" onClick={onBack}>
          ‹ Back
        </Button>
      </div>

      <div className="card">
        <h2 className="card__title">Race details</h2>
        <p className="card__meta">
          Status: {race.status} • Lanes: {race.laneCount}
        </p>
      </div>
    </section>
  );
}