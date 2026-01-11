import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeRace, createRace, fetchRace, fetchRaces, updateRace } from "../api/races";
import { CompleteRaceParams, CreateRaceParams, Race, RaceUpsertParams } from "../types/race";
import { toast } from "react-hot-toast";
import { toastOnce } from "../api/queryClient";

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

export function useCreateRace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateRaceParams) => createRace(params),
    onSuccess: (newRace) => {
      queryClient.invalidateQueries({ queryKey: ["races"] });
      queryClient.setQueryData(["races", newRace.id], newRace);
    },
  });
}

export function useUpdateRace(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: RaceUpsertParams) => updateRace(id, params),
    onSuccess: (race) => {
      toastOnce("updated", () => toast.success("Race updated!"));
      qc.setQueryData(["races", id], race);
      qc.invalidateQueries({ queryKey: ["races"] });
    },
  });
}

export function useCompleteRace(raceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CompleteRaceParams) => completeRace(raceId, params),
    onSuccess: (race) => {
      toastOnce("completed", () => toast.success("Race completed!"));
      qc.invalidateQueries({ queryKey: ["races"] });
      qc.setQueryData(["races", race.id], race);
    },
  });
}
