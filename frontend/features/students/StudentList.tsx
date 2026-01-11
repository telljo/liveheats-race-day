import React from "react";
import Button from "../../components/Button";
import { useRaces } from "../../hooks/useRaces"
import { useStudents } from "../../hooks/useStudents";

type Props = {
  onCreateStudent: () => void;
};

export default function StudentList({onCreateStudent}: Props) {
  const { data: students, isLoading } = useStudents();

  if (isLoading) return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>Students</h1>
        <span className="cluster">
          <Button
            variant="secondary"
            size="md"
            onClick={() => (window.location.href = "/races")}
          >
            ‹ Back
          </Button>
          <Button variant="primary" size="md" onClick={onCreateStudent}>
            + New student
          </Button>
        </span>
      </div>
      <div className="card">
        Loading…
      </div>
    </section>
  );

  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>Students</h1>
        <span className="cluster">
          <Button
            variant="secondary"
            size="md"
            onClick={() => (window.location.href = "/races")}
          >
            ‹ Back
          </Button>
          <Button variant="primary" size="md" onClick={onCreateStudent}>
            + New student
          </Button>
        </span>
      </div>

      {students?.length === 0 ? (
        <div className="card">
          <h2 className="card__title">No students yet</h2>
          <p className="card__meta">
            Create students
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Button variant="primary" size="md" onClick={onCreateStudent}>
              Create your first student
            </Button>
          </div>
        </div>
      ) : (
        <div className="stack stack--sm">
          {students?.map((student) => (
            <span
              key={student.id}
              className="student-list-item"
            >
              <div className="student-list-item__main">
                <div className="student-list-item__title">{student.firstName} {student.lastName}</div>
              </div>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}