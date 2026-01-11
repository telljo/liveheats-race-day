export interface RaceResult {
  id: number;
  studentId: number;
  place: number;
}

export type RaceResultParams = { place: number; student_id: number };