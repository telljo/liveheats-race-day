import { useQuery } from "@tanstack/react-query";
import { fetchRace, fetchRaces } from "../api/races";

export function useRaces() {
  return useQuery({
    queryKey: ["races"],
    queryFn: fetchRaces,
    staleTime: 30_000,
  });
}

export function useRace(id: number) {
  return useQuery({
    queryKey: ["races", id],
    queryFn: () => fetchRace(id),
    enabled: Number.isFinite(id),
    staleTime: 30_000,
  });
}
