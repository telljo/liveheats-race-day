import { describe, expect, it } from "vitest";
import { DraftLane, normalizeLanes, validatePlacings } from "./raceInlineEditorUtils";

function lane(laneNumber: number, studentId: number | null, id?: number): DraftLane {
  return { laneNumber, studentId, ...(id ? { id } : {}) };
}

describe("normalizeLanes", () => {
  it("ensures at least 2 active lanes", () => {
    const result = normalizeLanes([]);
    const active = result.filter((l) => !l._destroy);

    expect(active).toHaveLength(2);
    expect(active[0]).toMatchObject({ laneNumber: 1, studentId: null });
    expect(active[1]).toMatchObject({ laneNumber: 2, studentId: null });
  });

  it("ensures exactly one trailing blank lane", () => {
    const result = normalizeLanes([lane(1, 10), lane(2, 11)]);
    const active = result.filter((l) => !l._destroy);

    // Two filled + trailing blank
    expect(active).toHaveLength(3);
    expect(active[2].studentId).toBeNull();
    expect(active[2].laneNumber).toBe(3);
  });

  it("removes duplicate trailing blanks (keeps a single blank)", () => {
    const result = normalizeLanes([lane(1, 10), lane(2, null), lane(3, null)]);
    const active = result.filter((l) => !l._destroy);

    // Should keep two lanes minimum, and only one blank at end
    expect(active).toHaveLength(2);
    expect(active[0]).toMatchObject({ laneNumber: 1, studentId: 10 });
    expect(active[1]).toMatchObject({ laneNumber: 2, studentId: null });
  });

  it("re-numbers active lanes contiguously after removal", () => {
    const input: DraftLane[] = [
      lane(1, 10, 100),
      lane(2, 11, 101),
      lane(3, 12, 102),
    ];

    // Simulate removing lane 2 (existing record)
    const removed: DraftLane[] = input.map((l) =>
      l.id === 101 ? { ...l, _destroy: true } : l
    );

    const result = normalizeLanes(removed);
    const active = result.filter((l) => !l._destroy);

    // active should become: lane 1 (10), lane 2 (12), lane 3 blank
    expect(active.map((l) => ({ laneNumber: l.laneNumber, studentId: l.studentId }))).toEqual([
      { laneNumber: 1, studentId: 10 },
      { laneNumber: 2, studentId: 12 },
      { laneNumber: 3, studentId: null },
    ]);
  });

  it("keeps destroyed rows with ids for Rails deletion", () => {
    const input: DraftLane[] = [
      lane(1, 10, 100),
      { ...lane(2, 11, 101), _destroy: true },
      lane(3, 12, 102),
    ];

    const result = normalizeLanes(input);

    const destroyed = result.filter((l) => l._destroy);
    expect(destroyed).toHaveLength(1);
    expect(destroyed[0]).toMatchObject({ id: 101, _destroy: true });
  });

  it("drops destroyed rows without ids (they were never persisted)", () => {
    const input: DraftLane[] = [
      lane(1, 10, 100),
      { laneNumber: 2, studentId: 11, _destroy: true }, // no id
    ];

    const result = normalizeLanes(input);

    expect(result.some((l) => l._destroy)).toBe(false);
  });
});

describe("validatePlacings", () => {
  it("accepts sequential placings", () => {
    expect(validatePlacings([1, 2, 3])).toBe(true);
  });

  it("accepts ties with competition ranking (1,1,3)", () => {
    expect(validatePlacings([1, 1, 3])).toBe(true);
  });

  it("rejects gaps that break competition ranking (1,1,4)", () => {
    expect(validatePlacings([1, 1, 4])).toBe(false);
  });

  it("rejects sequences that do not start at 1", () => {
    expect(validatePlacings([2, 3])).toBe(false);
  });

  it("rejects empty or all-null input", () => {
    expect(validatePlacings([null, null])).toBe(false);
    expect(validatePlacings([])).toBe(false);
  });
});
