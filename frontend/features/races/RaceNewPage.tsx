import React, { useState } from "react";
import Button from "../../components/Button";

export default function RaceNewPage() {
  const [name, setName] = useState("");

  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>New race</h1>
        <Button variant="primary" size="md" onClick={() => (window.location.href = "/races")}>
          ‹ Back
        </Button>
      </div>

      <div className="card stack stack--sm">
        <label>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Race name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Year 5 – Heat 2"
            className="input"
          />
        </label>

        <div className="cluster cluster--between">
          <span style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            Next: assign students to lanes
          </span>

          <Button
            variant="primary"
            size="md"
            onClick={() => alert(`Save race: ${name || "(unnamed)"}`)}
          >
            Create race
          </Button>
        </div>
      </div>
    </section>
  );
}