import { Race } from "../types/race";

export type DraftLane = {
  id?: number;
  laneNumber: number;
  studentId: number | null;
  _destroy?: boolean;
};

/**
 * Creates the initial place map keyed by studentId.
 * Pulls any existing race results so edits are preserved
 * when returning to the results step.
 */
export function computeInitialPlacesByStudentId(
  race: Race,
  assignedStudentIds: number[]
) {
  const initial: Record<number, number | null> = {};
  for (const sid of assignedStudentIds) initial[sid] = null;

  for (const rr of race.raceResults ?? []) {
    if (rr.studentId != null && rr.studentId in initial) {
      initial[rr.studentId] = rr.place ?? null;
    }
  }

  return initial;
}


/**
 * Builds params for creating/updating a draft race.
 * Filters out empty rows and formats lane attributes
 * for Rails nested attributes (_destroy, id, etc).
 */
export function buildDraftParams(name: string, lanes: DraftLane[]) {
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

/**
 * Returns a new array sorted by laneNumber ascending.
 * Used to ensure stable, predictable ordering in the results step.
 */
export function sortByLaneNumber<T extends { laneNumber: number }>(arr: T[]) {
  return arr.slice().sort((a, b) => a.laneNumber - b.laneNumber);
}

/**
 * Converts a Race from the API into DraftLane state
 * suitable for the editor UI.
 *
 * Ensures:
 * - lanes are sorted
 * - at least one editable row exists
 * - UI invariants are respected via normalizeLanes
 */
export function mapRaceToDraftLanes(race: Race): DraftLane[] {
  const existing = (race.laneAssignments ?? []).map((la) => ({
    id: la.id,
    laneNumber: la.laneNumber,
    studentId: la.studentId ?? null,
  }));

  const active = existing.length
    ? sortByLaneNumber(existing)
    : [{ laneNumber: 1, studentId: null }];

  return normalizeLanes(active);
}

/**
 * Ensures there is always a trailing blank lane so the user
 * can add another student without clicking an "Add" button.
 */
export function ensureTrailingBlankLane(active: DraftLane[]) {
  const last = active[active.length - 1];
  if (!last || last.studentId != null) {
    return [...active, { laneNumber: active.length + 1, studentId: null }];
  }
  return active;
}

/**
 * Normalises lane state after any edit:
 * - keeps _destroy rows for Rails deletion (only if they have an id)
 * - ensures at least 2 active lanes
 * - removes duplicate trailing blanks
 * - guarantees one blank lane at the end
 * - re-numbers active lanes contiguously
 */
export function normalizeLanes(next: DraftLane[]) {
  const destroyed = next.filter((l) => l._destroy && l.id);
  let active = next.filter((l) => !l._destroy);

  while (active.length < 2) {
    active.push({ laneNumber: active.length + 1, studentId: null });
  }

  while (
    active.length > 2 &&
    active[active.length - 1].studentId == null &&
    active[active.length - 2].studentId == null
  ) {
    active.pop();
  }

  active = ensureTrailingBlankLane(active);

  // Renumber active lanes contiguously starting from 1
  active = active.map((l, idx) => ({ ...l, laneNumber: idx + 1 }));

  return [...active, ...destroyed];
}

/**
 * Validates placings using competition ranking rules.
 * Allows ties (e.g. 1,1,3) but rejects invalid gaps like 1,1,4.
 */
export function validatePlacings(places: Array<number | null>) {
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
