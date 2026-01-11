import { useMemo, useState } from "react";
import Button from "../../components/Button";
import { useCompleteRace, useUpdateRace } from "../../hooks/useRaces";
import { useStudents } from "../../hooks/useStudents";
import { Race } from "../../types/race";
import React from "react";

type DraftLane = {
  id?: number;
  laneNumber: number;
  studentId: number | null;
  _destroy?: boolean;
};

type Props = {
  race: Race;
  raceId: number;
  onBack: () => void;
};

export default function RaceInlineEditor({ race, raceId, onBack }: Props) {
  const { data: students = [] } = useStudents();
  const updateMutation = useUpdateRace(raceId);
  const completeMutation = useCompleteRace(raceId);

  const [name, setName] = useState(race.name ?? "");

  type Step = "edit" | "results";
  const [step, setStep] = useState<Step>("edit");

  const [lanes, setLanes] = useState<DraftLane[]>(() => {
    const existing = (race.laneAssignments ?? [])
      .slice()
      .sort((a, b) => a.laneNumber - b.laneNumber)
      .map((la) => ({
        id: la.id,
        laneNumber: la.laneNumber,
        studentId: la.studentId ?? null,
      }));

    // Ensure at least one row, and a trailing blank
    const base = existing.length
      ? existing
      : [{ laneNumber: 1, studentId: null }];
    const last = base[base.length - 1];
    return last.studentId
      ? [...base, { laneNumber: base.length + 1, studentId: null }]
      : base;
  });

  const selectedStudentIds = useMemo(() => {
    const ids = lanes
      .filter((l) => !l._destroy)
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
        const next = prev.map((l, i) =>
          i === index ? { ...l, _destroy: true } : l
        );
        return normalizeLanes(next);
      }

      // New row: remove it entirely
      const next = prev.filter((_, i) => i !== index);
      return normalizeLanes(next);
    });
  }

  function buildDraftParams() {
    return {
      name: name.trim(),
      lane_assignments_attributes: lanes
        .filter((l) => l.studentId != null || l._destroy)
        .map((l) => ({
          ...(l.id ? { id: l.id } : {}),
          ...(l._destroy ? { _destroy: true } : {}),
          lane_number: l.laneNumber,
          student_id: l.studentId as number,
        })),
    };
  }

  // ---------- Results step state ----------
  const activeAssignedLanes = useMemo(() => {
    return lanes.filter((l) => !l._destroy).filter((l) => l.studentId != null);
  }, [lanes]);

  const studentsById = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  // Prefill results from existing raceResults (if any)
  const initialPlacesByStudentId = useMemo(() => {
    const initial: Record<number, number | null> = {};

    for (const l of activeAssignedLanes) {
      const sid = l.studentId as number;
      initial[sid] = null;
    }

    for (const rr of race.raceResults ?? []) {
      if (rr.studentId != null) initial[rr.studentId] = rr.place ?? null;
    }

    return initial;
    // NOTE: intentionally only depends on race + activeAssignedLanes
  }, [race.raceResults, activeAssignedLanes]);

  const [placesByStudentId, setPlacesByStudentId] = useState<
    Record<number, number | null>
  >(() => initialPlacesByStudentId);

  // Keep places map in sync when assigned students change
  React.useEffect(() => {
    setPlacesByStudentId((prev) => {
      const next: Record<number, number | null> = { ...prev };
      const assigned = new Set(
        activeAssignedLanes.map((l) => l.studentId as number)
      );

      // add missing
      for (const studentId of assigned) {
        if (!(studentId in next))
          next[studentId] = initialPlacesByStudentId[studentId] ?? null;
      }

      // remove stale
      for (const key of Object.keys(next)) {
        const id = Number(key);
        if (!assigned.has(id)) delete next[id];
      }

      return next;
    });
  }, [activeAssignedLanes, initialPlacesByStudentId]);

  const placeOptions = useMemo(() => {
    const n = activeAssignedLanes.length;
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [activeAssignedLanes.length]);

  function validatePlacings(places: Array<number | null>) {
    const compact = places.filter(
      (p): p is number => Number.isInteger(p) && (p as number) > 0
    );
    if (compact.length === 0) return false;

    const counts = new Map<number, number>();
    for (const p of compact) counts.set(p, (counts.get(p) ?? 0) + 1);

    const distinct = Array.from(counts.keys()).sort((a, b) => a - b);
    if (distinct[0] !== 1) return false;

    for (let i = 0; i < distinct.length; i++) {
      const p = distinct[i];
      const next = distinct[i + 1];
      const expectedNext = p + (counts.get(p) ?? 0);
      if (next == null) break;
      if (next !== expectedNext) return false;
    }

    return true;
  }

  const placesList = useMemo(() => {
    return activeAssignedLanes.map(
      (l) => placesByStudentId[l.studentId as number] ?? null
    );
  }, [activeAssignedLanes, placesByStudentId]);

  const allPlacesSelected =
    activeAssignedLanes.length >= 2 && placesList.every((p) => p != null);

  const placingsAreValid = validatePlacings(placesList);

  function buildCompleteParams() {
    const base = buildDraftParams();

    return {
      ...base,
      race_results_attributes: activeAssignedLanes.map((l) => {
        const studentId = l.studentId as number;
        return {
          student_id: studentId,
          place: placesByStudentId[studentId] as number,
        };
      }),
    };
  }

  // ---------- UI guards ----------
  const canSaveDraft = name.trim().length > 0;
  const isBusy = updateMutation.isPending || completeMutation.isPending;

  // Must have at least 2 filled lanes to proceed to results
  const canEnterResultsStep =
    name.trim().length > 0 && activeAssignedLanes.length >= 2;

  const mapRaceToDraftLanes = (race: Race): DraftLane[] =>
    (race.laneAssignments ?? []).map((la) => ({
      id: la.id,
      laneNumber: la.laneNumber,
      studentId: la.studentId,
    }))
    .sort((a, b) => a.laneNumber - b.laneNumber);

  const handleSaveAndNext = () => {
    updateMutation.mutate(buildDraftParams(), {
      onSuccess: (updatedRace) => {
        setLanes(mapRaceToDraftLanes(updatedRace));
        setStep("results");
      },
    });
  };

  function autoFillPlacesSequential() {
    // 1..N based on lane order (ties can be edited manually)
    setPlacesByStudentId((prev) => {
      const next = { ...prev };
      activeAssignedLanes.forEach((l, idx) => {
        next[l.studentId as number] = idx + 1;
      });
      return next;
    });
  }

  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>
          {step === "edit" ? "Edit draft race" : "Enter race results"}
        </h1>

        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            onBack();
          }}
          disabled={isBusy}
        >
          ‹ Back to Races
        </Button>
      </div>

      <div className="card stack stack--md">
        <label>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            Race name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g. Year 5 – Heat 2"
            disabled={isBusy}
          />
        </label>

        {step === "edit" ? (
          <>
            <div className="stack stack--sm">
              <div style={{ fontWeight: 600 }}>Lane assignments</div>

              {(() => {
                const activeLanes = lanes.filter((l) => !l._destroy);
                const canRemoveLane = activeLanes.length > 3; // includes trailing blank

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
                          <div
                            className="cluster"
                            style={{ gap: "0.75rem", flex: 1 }}
                          >
                            <div
                              style={{ width: 90, color: "var(--color-muted)" }}
                            >
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
                              disabled={isBusy}
                            >
                              <option value="">Select a student…</option>
                              {students.map((s) => {
                                const disabled =
                                  selectedStudentIds.has(s.id) &&
                                  lane.studentId !== s.id;

                                return (
                                  <option
                                    key={s.id}
                                    value={s.id}
                                    disabled={disabled}
                                  >
                                    {s.firstName} {s.lastName}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {lane.studentId != null && canRemoveLane && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeLane(idx)}
                              disabled={isBusy}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div
                style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}
              >
                Selecting a student in the last lane adds another lane
                automatically.
              </div>
            </div>

            <div className="cluster cluster--between">
              <Button
                variant="secondary"
                size="md"
                onClick={onBack}
                disabled={isBusy}
              >
                Cancel
              </Button>

              <div className="cluster">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!canSaveDraft || !canEnterResultsStep || isBusy}
                  onClick={handleSaveAndNext}
                >
                  Save & Next ›
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stack stack--sm">
              <div className="cluster cluster--between">
                <div style={{ fontWeight: 600 }}>Results</div>

                <div className="cluster">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={autoFillPlacesSequential}
                    disabled={isBusy || activeAssignedLanes.length < 2}
                  >
                    Auto-fill 1–{activeAssignedLanes.length}
                  </Button>
                </div>
              </div>

              <div
                style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}
              >
                For ties, select the same place for tied students (e.g. 1, 1,
                3).
              </div>

              {allPlacesSelected && !placingsAreValid && (
                <div
                  className="card__meta"
                  style={{ color: "var(--color-danger)" }}
                >
                  Placings are invalid. With ties, places must use competition
                  ranking (e.g. 1, 1, 3).
                </div>
              )}

              <table className="table">
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Student</th>
                    <th>Place</th>
                  </tr>
                </thead>

                <tbody>
                  {activeAssignedLanes.map((lane) => {
                    const sid = lane.studentId as number;
                    const student = studentsById.get(sid) ?? null;

                    return (
                      <tr key={`result-${lane.id ?? sid}`}>
                        <td className="table__lane">{lane.laneNumber}</td>

                        <td>
                          {student ? (
                            `${student.firstName} ${student.lastName}`
                          ) : (
                            <span className="table__muted">
                              Unknown student
                            </span>
                          )}
                        </td>

                        <td>
                          <select
                            className="input"
                            value={placesByStudentId[sid] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value
                                ? Number(e.target.value)
                                : null;
                              setPlacesByStudentId((prev) => ({
                                ...prev,
                                [sid]: v,
                              }));
                            }}
                            disabled={isBusy}
                          >
                            <option value="">Select…</option>
                            {placeOptions.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="cluster cluster--between">
              <div
                style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}
              >
                Select places for each lane to complete the race.
              </div>
              <Button
                variant="success"
                size="md"
                disabled={isBusy || !allPlacesSelected || !placingsAreValid}
                onClick={() => completeMutation.mutate(buildCompleteParams())}
              >
                Confirm &amp; complete
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
