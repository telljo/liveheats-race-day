import camelcaseKeysDeep from "camelcase-keys-deep";
import { LaneAssignment } from "./laneAssigment";
import { RaceResult } from "./RaceResult";

export type RaceStatus = "draft" | "completed";

/** Rails API shape */
export interface ApiRace {
  id: number;
  name: string;
  status: RaceStatus;
  created_at: string;
  updated_at: string;
  lane_assignments: LaneAssignment[];
  race_results: RaceResult[];
}

/** App shape */
export interface Race {
  id: number;
  name: string;
  status: RaceStatus;
  createdAt: string;
  updatedAt: string;
  laneAssignments: LaneAssignment[];
  raceResults: RaceResult[];
}

export function mapRaceApiToRace(r: ApiRace): Race {
  return camelcaseKeysDeep(r) as Race;
}