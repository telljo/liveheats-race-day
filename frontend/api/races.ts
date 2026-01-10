import { ApiRace, mapRaceApiToRace, Race } from "../types/race";
import { apiFetch } from "./client";

export async function fetchRaces(): Promise<Race[]> {
  const data = await apiFetch<ApiRace[]>("/api/v1/races");
  return data.map(mapRaceApiToRace);
}

export async function fetchRace(id: number): Promise<Race> {
  const data = await apiFetch<ApiRace>(`/api/v1/races/${id}`);
  return mapRaceApiToRace(data);
}