export interface LaneAssignment {
  id: number;
  laneNumber: number;
  studentId: number;
}

export type LaneAssignmentParams = {
  id?: number;
  lane_number: number;
  student_id: number;
  _destroy?: boolean;
}
