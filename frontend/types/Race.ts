import camelcaseKeysDeep from "camelcase-keys-deep";
import { LaneAssignment, LaneAssignmentParams } from "./laneAssigment";
import { RaceResult, RaceResultParams } from "./RaceResult";

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

export type CreateRaceParams = {
  name: string;
  lane_assignments_attributes: LaneAssignmentParams[];
};

export type RaceUpsertParams = {
  name: string;
  lane_assignments_attributes: LaneAssignmentParams[];
  race_results_attributes?: RaceResultParams[];
};

export function mapRaceApiToRace(r: ApiRace): Race {
  return camelcaseKeysDeep(r) as Race;
}