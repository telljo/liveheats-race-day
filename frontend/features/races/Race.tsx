import React, { useMemo, useState } from "react";
import Button from "../../components/Button";
import { Race } from "../../types/race";
import { useStudents } from "../../hooks/useStudents";
import { useCompleteRace, useUpdateRace } from "../../hooks/useRaces";

type Props = {
  race: Race;
  raceId: number;
  onBack: () => void;
};

type DraftLane = {
  id?: number;
  laneNumber: number;
  studentId: number | null;
  _destroy?: boolean;
};

export default function Race({ race, raceId, onBack }: Props) {
  const isDraft = race.status === "draft";
  const { data: students = [], isLoading, isError, error } = useStudents();

  const studentsById = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const raceResultsByStudentId = useMemo(() => {
    return new Map(
      (race.raceResults ?? []).map((r) => [r.studentId, r])
    );
  }, [race.raceResults]);

  const lanes = useMemo(() => {
    return (race.laneAssignments ?? [])
      .slice()
      .sort((a, b) => a.laneNumber - b.laneNumber)
      .map((la) => ({
        ...la,
        student: studentsById.get(la.studentId) ?? null,
        result: raceResultsByStudentId.get(la.studentId) ?? null,
      }));
  }, [race.laneAssignments, studentsById, raceResultsByStudentId]);


  if (isLoading) return <div className="card">Loading…</div>;
  if (isError)
    return <div className="card">Error: {(error as Error)?.message}</div>;

  if(!isDraft) {
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
          <p className="card__meta">Status: {race.status.charAt(0).toUpperCase() + race.status.slice(1)}</p>

          <div className="stack stack--sm" style={{ marginTop: "1rem" }}>
            {lanes.length === 0 ? (
              <p className="card__meta">No lane assignments yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Student</th>
                    <th>Place</th>
                  </tr>
                </thead>
                <tbody>
                  {lanes.map((lane) => (
                    <tr key={lane.id}>
                      <td className="table__lane">{lane.laneNumber}</td>

                      <td>
                        {lane.student ? (
                          `${lane.student.firstName} ${lane.student.lastName}`
                        ) : (
                          <span className="table__muted">Unknown student</span>
                        )}
                      </td>
                      <td>
                        {lane.result ? (
                          <div className={`table__place table__place--${lane.result.place}`}>
                            <p>
                              <strong>{lane.result.place}</strong>
                            </p>
                          </div>
                        ) : (
                          <span className="table__muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    );
  }

  return <RaceInlineEditor race={race} raceId={raceId} onBack={onBack} />;

  function RaceInlineEditor({ race, raceId, onBack }: Props) {
    const { data: students = [] } = useStudents();
    const updateMutation = useUpdateRace(raceId);
    const completeMutation = useCompleteRace(raceId);

    const [name, setName] = useState(race.name ?? "");
    const [lanes, setLanes] = useState<DraftLane[]>(() => {
    const existing =
      (race.laneAssignments ?? [])
        .slice()
        .sort((a, b) => a.laneNumber - b.laneNumber)
        .map((la) => ({
          id: la.id,
          laneNumber: la.laneNumber,
          studentId: la.studentId ?? null,
        }));

      // Ensure at least one row, and a trailing blank
      const base = existing.length ? existing : [{ laneNumber: 1, studentId: null }];
      const last = base[base.length - 1];
      return last.studentId ? [...base, { laneNumber: base.length + 1, studentId: null }] : base;
    });

    const selectedStudentIds = useMemo(() => {
      const ids = lanes
        .filter(l => !l._destroy)
        .map((l) => l.studentId)
        .filter((x): x is number => x != null);
      return new Set(ids);
    }, [lanes]);

    function normalizeLanes(next: DraftLane[]) {
      // Keep destroyed rows (with ids) around so Rails can delete them,
      // but DON'T let them affect numbering or UI.
      const destroyed = next.filter((l) => l._destroy && l.id);

      let active = next.filter((l) => !l._destroy);

      // Ensure at least 2 active rows exist (can be blank)
      while (active.length < 2) {
        active.push({ laneNumber: active.length + 1, studentId: null });
      }

      // Remove duplicate blank tails (on active only)
      while (
        active.length > 2 &&
        active[active.length - 1].studentId == null &&
        active[active.length - 2].studentId == null
      ) {
        active.pop();
      }

      // If last active is filled, add a blank
      const last = active[active.length - 1];
      if (last.studentId != null) {
        active.push({ laneNumber: active.length + 1, studentId: null });
      }

      // Renumber ACTIVE lanes contiguously
      active = active.map((l, idx) => ({ ...l, laneNumber: idx + 1 }));

      // Append destroyed rows after active rows (lane_number for destroyed rows doesn't matter)
      return [...active, ...destroyed];
    }

    function setLaneStudent(index: number, studentId: number | null) {
      setLanes((prev) => {
        const next = prev.map((l, i) => (i === index ? { ...l, studentId } : l));
        return normalizeLanes(next);
      });
    }

    function removeLane(index: number) {
      setLanes((prev) => {
        const activeCount = prev.filter((l) => !l._destroy).length;
        if (activeCount <= 2) return prev; // hard guard: keep at least 2 active lanes

        const lane = prev[index];
        if (!lane) return prev;

        // If it exists in DB, mark for destroy (but it won't affect numbering)
        if (lane.id) {
          const next = prev.map((l, i) => (i === index ? { ...l, _destroy: true } : l));
          return normalizeLanes(next);
        }

        // New row: remove it entirely
        const next = prev.filter((_, i) => i !== index);
        return normalizeLanes(next);
      });
    }

    function buildParams() {
      return {
        name: name.trim(),
        lane_assignments_attributes: lanes
          .filter((l) => l.studentId != null || l._destroy)
          .map((l, idx) => ({
            ...(l.id ? { id: l.id } : {}),
            ...(l._destroy ? { _destroy: true } : {}),
            lane_number: l.laneNumber,
            student_id: l.studentId as number
          }))
          // add race_results here later if I want inline entry
      };
    }

    const canSaveDraft = name.trim().length > 0;
    const isBusy = updateMutation.isPending || completeMutation.isPending;

    return (
      <section className="stack stack--md">
        <div className="cluster cluster--between">
          <h1 style={{ margin: 0 }}>Edit draft race</h1>
          <Button variant="secondary" size="md" onClick={onBack}>
            ‹ Back
          </Button>
        </div>

        <div className="card stack stack--md">
          <label>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Race name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Year 5 – Heat 2"
            />
          </label>

          <div className="stack stack--sm">
            <div style={{ fontWeight: 600 }}>Lane assignments</div>
            {(() => {
              const activeLanes = lanes.filter((l) => !l._destroy);
              const canRemoveLane = activeLanes.length > 3; // Use three here because the trailing lane is counted.

              return (
                <div className="stack stack--xs">
                  {lanes.map((lane, idx) => {
                    if (lane._destroy) return null;

                    return (
                      <div
                        key={lane.id ?? `lane-${idx}`}
                        className="cluster cluster--between"
                        style={{
                          padding: "0.5rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                        }}
                      >
                        <div className="cluster" style={{ gap: "0.75rem", flex: 1 }}>
                          <div style={{ width: 90, color: "var(--color-muted)" }}>
                            Lane {lane.laneNumber}
                          </div>

                          <select
                            className="input"
                            style={{ flex: 1 }}
                            value={lane.studentId ?? ""}
                            onChange={(e) =>
                              setLaneStudent(
                                idx,
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          >
                            <option value="">Select a student…</option>
                            {students.map((s) => {
                              const disabled =
                                selectedStudentIds.has(s.id) && lane.studentId !== s.id;

                              return (
                                <option key={s.id} value={s.id} disabled={disabled}>
                                  {s.firstName} {s.lastName}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {lane.studentId != null && canRemoveLane && (
                          <Button variant="danger" size="sm" onClick={() => removeLane(idx)}>
                            Remove
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
              Selecting a student in the last lane adds another lane automatically.
            </div>
          </div>

          <div className="cluster cluster--between">
            <Button variant="secondary" size="md" onClick={onBack} disabled={isBusy}>
              Cancel
            </Button>

            <div className="cluster">
              <Button
                variant="success"
                size="md"
                disabled={!canSaveDraft || isBusy}
                onClick={() => updateMutation.mutate(buildParams())}
              >
                Save draft
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={isBusy}
                onClick={() => completeMutation.mutate(buildParams())}
              >
                Complete race
              </Button>
            </div>
          </div>
        </div>
</section>

    );
  }
}
