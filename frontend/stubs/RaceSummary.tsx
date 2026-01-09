export type RaceSummary = {
  id: string;
  name: string;
  status: "draft" | "completed";
  laneCount: number;
};