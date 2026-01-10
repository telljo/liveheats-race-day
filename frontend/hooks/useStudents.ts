import { useQuery } from "@tanstack/react-query";
import { fetchStudent, fetchStudents } from "../api/students";

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: 30_000,
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => fetchStudent(id),
    enabled: Number.isFinite(id),
    staleTime: 30_000,
  });
}
