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