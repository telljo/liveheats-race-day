import { ApiStudent, mapStudentApiToStudent, Student } from "../types/Student";
import { apiFetch } from "./client";

export async function fetchStudents(): Promise<Student[]> {
  const data = await apiFetch<ApiStudent[]>("/api/v1/students");
  return data.map(mapStudentApiToStudent);
}

export async function fetchStudent(id: number): Promise<Student> {
  const data = await apiFetch<ApiStudent>(`/api/v1/students/${id}`);
  return mapStudentApiToStudent(data);
}