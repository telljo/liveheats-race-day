export interface RaceResult {
  id: number;
  studentId: number;
  place: number;
}

export type RaceResultParams = {
  id?: number;
  place: number;
  student_id: number
};

export function validatePlacings(places: Array<number | null>) {
  const compact = places.filter((p): p is number => Number.isInteger(p) && (p as number) > 0);
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