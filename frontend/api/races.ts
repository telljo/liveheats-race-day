import { ApiRace, CompleteRaceParams, CreateRaceParams, mapRaceApiToRace, Race, RaceUpsertParams } from "../types/race";
import { apiFetch } from "./client";

export async function fetchRaces(): Promise<Race[]> {
  const data = await apiFetch<ApiRace[]>("/api/v1/races");
  return data.map(mapRaceApiToRace);
}

export async function fetchRace(id: number): Promise<Race> {
  const data = await apiFetch<ApiRace>(`/api/v1/races/${id}`);
  return mapRaceApiToRace(data);
}

export async function createRace(params: CreateRaceParams): Promise<Race> {
  const data = await apiFetch<ApiRace>("/api/v1/races", {
    method: "POST",
    json: { race: params },
  });

  return mapRaceApiToRace(data);
}

export async function updateRace(id: number, params: RaceUpsertParams): Promise<Race> {
  const data = await apiFetch<ApiRace>(`/api/v1/races/${id}`, {
    method: "PATCH",
    json: { race: params },
  });
  return mapRaceApiToRace(data);
}

export async function completeRace(id: number, params: CompleteRaceParams): Promise<Race> {
  const data = await apiFetch<ApiRace>(`/api/v1/races/${id}/complete`, {
    method: "POST",
    json: { race: { name: params.name, race_results_attributes: params.race_results_attributes } },
  });
  return mapRaceApiToRace(data);
}