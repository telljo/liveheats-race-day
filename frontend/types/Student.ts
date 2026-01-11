import camelcaseKeysDeep from "camelcase-keys-deep";

/** Rails API shape */
export interface ApiStudent {
  id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

/** App shape */
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStudentParams = {
  first_name: string;
  last_name: string;
};

export function mapStudentApiToStudent(r: ApiStudent): Student {
  return camelcaseKeysDeep(r) as Student;
}