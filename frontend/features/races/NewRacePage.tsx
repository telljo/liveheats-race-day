import React from "react";
import Button from "../../components/Button";
import NewRace from "./NewRace";

export default function NewRacePage() {
  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>New race</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => (window.location.href = "/races")}
        >
          ‹ Back
        </Button>
      </div>

      <NewRace onCancel={() => (window.location.href = "/races")} />
    </section>
  );
}
