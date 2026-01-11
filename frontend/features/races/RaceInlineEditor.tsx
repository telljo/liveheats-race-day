import React, { useEffect, useMemo, useState } from "react";
import Button from "../../components/Button";
import { useCompleteRace, useUpdateRace } from "../../hooks/useRaces";
import { useStudents } from "../../hooks/useStudents";
import { Race } from "../../types/race";
import { buildDraftParams, computeInitialPlacesByStudentId, DraftLane, mapRaceToDraftLanes, normalizeLanes, sortByLaneNumber, validatePlacings } from "../../utils/raceInlineEditorUtils";

type Props = {
  race: Race;
  raceId: number;
  onBack: () => void;
};

type Step = "edit" | "results";

/* ------------------------------ Component ------------------------------ */

export default function RaceInlineEditor({ race, raceId, onBack }: Props) {
  const { data: students = [] } = useStudents();
  const updateMutation = useUpdateRace(raceId);
  const completeMutation = useCompleteRace(raceId);

  const [step, setStep] = useState<Step>("edit");
  const [name, setName] = useState(race.name ?? "");
  const [lanes, setLanes] = useState<DraftLane[]>(() =>
    mapRaceToDraftLanes(race)
  );

  const isBusy = updateMutation.isPending || completeMutation.isPending;

  /* --------------------------- Edit step state -------------------------- */

  const activeLanes = useMemo(
    () => lanes.filter((l) => !l._destroy),
    [lanes]
  );

  const activeAssignedLanes = useMemo(
    () => activeLanes.filter((l) => l.studentId != null),
    [activeLanes]
  );

  const selectedStudentIds = useMemo(() => {
    const ids = activeAssignedLanes.map((l) => l.studentId as number);
    return new Set(ids);
  }, [activeAssignedLanes]);

  const canRemoveLane = activeLanes.length > 3; // includes trailing blank
  const canSaveDraft = name.trim().length > 0;
  const canEnterResultsStep = canSaveDraft && activeAssignedLanes.length >= 2;

  /* -------------------------- Results step state ------------------------- */

  const studentsById = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const sortedAssignedLanes = useMemo(
    () => sortByLaneNumber(activeAssignedLanes),
    [activeAssignedLanes]
  );

  const assignedStudentIds = useMemo(
    () => sortedAssignedLanes.map((l) => l.studentId as number),
    [sortedAssignedLanes]
  );

  const initialPlacesByStudentId = useMemo(
    () => computeInitialPlacesByStudentId(race, assignedStudentIds),
    [race, assignedStudentIds]
  );

  const [placesByStudentId, setPlacesByStudentId] = useState<
    Record<number, number | null>
  >(() => initialPlacesByStudentId);

  // Keep places map in sync when assigned students change
  useEffect(() => {
    setPlacesByStudentId((prev) => {
      const next = { ...prev };

      // Add missing keys
      for (const sid of assignedStudentIds) {
        if (!(sid in next)) next[sid] = initialPlacesByStudentId[sid] ?? null;
      }

      // Remove stale keys
      for (const key of Object.keys(next)) {
        const id = Number(key);
        if (!assignedStudentIds.includes(id)) delete next[id];
      }

      return next;
    });
  }, [assignedStudentIds, initialPlacesByStudentId]);

  const placeOptions = useMemo(() => {
    const n = sortedAssignedLanes.length;
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [sortedAssignedLanes.length]);

  const placesList = useMemo(() => {
    return sortedAssignedLanes.map(
      (l) => placesByStudentId[l.studentId as number] ?? null
    );
  }, [sortedAssignedLanes, placesByStudentId]);

  const allPlacesSelected =
    sortedAssignedLanes.length >= 2 && placesList.every((p) => p != null);

  const placingsAreValid = validatePlacings(placesList);

  /* ------------------------------- Actions ------------------------------ */

  /**
   * Assigns or clears a student in a lane and re-normalises
   * the lane list to preserve UI invariants.
   */
  const setLaneStudent = (index: number, studentId: number | null) => {
    setLanes((prev) => {
      const next = prev.map((l, i) => (i === index ? { ...l, studentId } : l));
      return normalizeLanes(next);
    });
  };

  /**
   * Removes a lane:
   * - existing records are marked _destroy for Rails
   * - new rows are removed entirely
   * Always keeps a minimum of 2 active lanes.
   */
  const removeLane = (index: number) => {
    setLanes((prev) => {
      const activeCount = prev.filter((l) => !l._destroy).length;
      if (activeCount <= 2) return prev; // keep at least 2 active lanes

      const lane = prev[index];
      if (!lane) return prev;

      if (lane.id) {
        // existing record: mark for destroy
        const next = prev.map((l, i) =>
          i === index ? { ...l, _destroy: true } : l
        );
        return normalizeLanes(next);
      }

      // new row: remove entirely
      return normalizeLanes(prev.filter((_, i) => i !== index));
    });
  };

  /**
   * Persists the draft race and advances to the results step.
   * Rehydrates lane state from the server so newly created
   * lane assignments have database IDs.
   */
  const handleSaveAndNext = () => {
    updateMutation.mutate(buildDraftParams(name, lanes), {
      onSuccess: (updatedRace) => {
        setLanes(mapRaceToDraftLanes(updatedRace));
        setStep("results");
      },
    });
  };

  /**
   * Convenience helper to auto-fill sequential placings
   * (1..N) based on lane order.
   */
  const autoFillPlacesSequential = () => {
    setPlacesByStudentId((prev) => {
      const next = { ...prev };
      sortedAssignedLanes.forEach((l, idx) => {
        next[l.studentId as number] = idx + 1;
      });
      return next;
    });
  };

  /**
   * Builds params required to complete the race,
   * combining draft lane data with race results.
   */
  const buildCompleteParams = () => {
    const base = buildDraftParams(name, lanes);

    return {
      ...base,
      race_results_attributes: sortedAssignedLanes.map((l) => {
        const studentId = l.studentId as number;
        return {
          student_id: studentId,
          place: placesByStudentId[studentId] as number,
        };
      }),
    };
  };

  /* --------------------------------- UI -------------------------------- */

  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>
          {step === "edit" ? "Edit draft race" : "Enter race results"}
        </h1>

        <Button variant="secondary" size="md" onClick={onBack} disabled={isBusy}>
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
                          disabled={isBusy}
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

              <div style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
                Selecting a student in the last lane adds another lane automatically.
              </div>
            </div>

            <div className="cluster cluster--between">
              <Button variant="secondary" size="md" onClick={onBack} disabled={isBusy}>
                Cancel
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={!canEnterResultsStep || isBusy}
                onClick={handleSaveAndNext}
              >
                Save & Next ›
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="stack stack--sm">
              <div className="cluster cluster--between">
                <div style={{ fontWeight: 600 }}>Results</div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={autoFillPlacesSequential}
                  disabled={isBusy || sortedAssignedLanes.length < 2}
                >
                  Auto-fill 1–{sortedAssignedLanes.length}
                </Button>
              </div>

              <div style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
                For ties, select the same place for tied students (e.g. 1, 1, 3).
              </div>

              {allPlacesSelected && !placingsAreValid && (
                <div className="card__meta" style={{ color: "var(--color-danger)" }}>
                  Placings are invalid. With ties, places must use competition ranking
                  (e.g. 1, 1, 3).
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
                  {sortedAssignedLanes.map((lane) => {
                    const sid = lane.studentId as number;
                    const student = studentsById.get(sid) ?? null;

                    return (
                      <tr key={`result-${lane.id ?? sid}`}>
                        <td className="table__lane">{lane.laneNumber}</td>

                        <td>
                          {student ? (
                            `${student.firstName} ${student.lastName}`
                          ) : (
                            <span className="table__muted">Unknown student</span>
                          )}
                        </td>

                        <td>
                          <select
                            className="input"
                            value={placesByStudentId[sid] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value ? Number(e.target.value) : null;
                              setPlacesByStudentId((prev) => ({ ...prev, [sid]: v }));
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
              <div style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
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
