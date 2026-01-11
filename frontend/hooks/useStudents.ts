import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudent, fetchStudent, fetchStudents } from "../api/students";
import { CreateStudentParams } from "../types/Student";

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

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateStudentParams) => createStudent(params),
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.setQueryData(["students", newStudent.id], newStudent);
    },
  });
}
