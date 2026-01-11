import React, { useMemo, useState } from "react";
import Button from "../../components/Button";
import { useStudents } from "../../hooks/useStudents";
import { useCreateRace } from "../../hooks/useRaces";
import { CreateRaceParams } from "../../types/race";

type Props = {
  onCancel: () => void;
};

type LaneAssignmentDraft = {
  id: string; // local UI id
  studentId: number | null;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NewRace({ onCancel }: Props) {
  const { data: students = [], isLoading, isError } = useStudents();
  const createRaceMutation = useCreateRace();

  const [name, setName] = useState("");
  const [laneAssignments, setLaneAssignments] = useState<LaneAssignmentDraft[]>([
    { id: uid(), studentId: null },
  ]);

  // Only keep "real" assignments (selected students)
  const selectedAssignments = useMemo(
    () => laneAssignments.filter((la) => la.studentId != null) as Array<
      Omit<LaneAssignmentDraft, "studentId"> & { studentId: number }
    >,
    [laneAssignments]
  );

  const selectedStudentIds = useMemo(() => {
    return new Set(selectedAssignments.map((a) => a.studentId));
  }, [selectedAssignments]);

  function ensureTrailingBlankRow(next: LaneAssignmentDraft[]) {
    const last = next[next.length - 1];
    const lastHasStudent = !!last?.studentId;

    // If the last row is filled, add a new empty row
    if (lastHasStudent) {
      return [...next, { id: uid(), studentId: null }];
    }

    // If user cleared some rows, keep exactly one trailing blank row
    // (remove extra blank rows at end)
    let trimmed = [...next];
    while (
      trimmed.length > 1 &&
      trimmed[trimmed.length - 1].studentId == null &&
      trimmed[trimmed.length - 2].studentId == null
    ) {
      trimmed.pop();
    }
    return trimmed;
  }

  function updateLaneAssignment(id: string, studentId: number | null) {
    setLaneAssignments((prev) => {
      const next = prev.map((la) => (la.id === id ? { ...la, studentId } : la));
      return ensureTrailingBlankRow(next);
    });
  }

  function removeLaneAssignment(id: string) {
    setLaneAssignments((prev) => {
      const next = prev.filter((la) => la.id !== id);
      // Always have at least one row
      const normalized = next.length === 0 ? [{ id: uid(), studentId: null }] : next;
      return ensureTrailingBlankRow(normalized);
    });
  }

  async function handleSave() {
    const racePayload: CreateRaceParams = {
      name: name.trim(),
      lane_assignments_attributes: selectedAssignments.map((a, index) => ({
        lane_number: index + 1,
        student_id: a.studentId,
      })),
    };

    createRaceMutation.mutate(racePayload, {
      onSuccess: (race) => {
        window.location.href = `/races/${race.id}`;
      },
    });
  }

  return (
    <div className="card stack stack--md">
      <label>
        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Race name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Year 5 – Heat 2"
          className="input"
        />
      </label>

      <div className="stack stack--sm">
        <div style={{ fontWeight: 600 }}>Lane assignments</div>

        {isLoading && <div className="card">Loading students…</div>}
        {isError && (
          <div className="card">
            <strong>Couldn’t load students</strong>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="stack stack--xs">
            {laneAssignments.map((la, idx) => {
              const laneNumber = idx + 1;

              return (
                <div
                  key={la.id}
                  className="cluster cluster--between"
                  style={{
                    padding: "0.5rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                >
                  <div className="cluster" style={{ gap: "0.75rem", flex: 1 }}>
                    <div style={{ width: 90, color: "var(--color-muted)" }}>
                      Lane {laneNumber}
                    </div>

                    <select
                      className="input"
                      style={{ flex: 1 }}
                      value={la.studentId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLaneAssignment(la.id, val ? Number(val) : null);
                      }}
                    >
                      <option value="">Select a student…</option>
                      {students.map((s) => {
                        const label = `${s.firstName} ${s.lastName}`.trim();
                        const disabled =
                          // disable if picked in another lane
                          selectedStudentIds.has(s.id) && la.studentId !== s.id;

                        return (
                          <option key={s.id} value={s.id} disabled={disabled}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* allow removing filled rows (but keep at least one row overall) */}
                  {la.studentId != null && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeLaneAssignment(la.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <span style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          Tip: selecting a student in the last row will automatically add a new lane.
        </span>
      </div>

      <div className="cluster cluster--between">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="md"
          disabled={createRaceMutation.isPending}
          onClick={handleSave}
        >
          Create race
        </Button>
      </div>
    </div>
  );
}
