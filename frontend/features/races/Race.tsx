import React from "react";
import Button from "../../components/Button";
import { Race } from "../../types/race";

type Props = {
  race: Race;
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
          Status: {race.status}
        </p>
      </div>
    </section>
  );
}