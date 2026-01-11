import React, { useMemo } from "react";
import Button from "../../components/Button";
import { Race } from "../../types/race";
import { useStudents } from "../../hooks/useStudents";
import RaceInlineEditor from "./RaceInlineEditor";

type Props = {
  race: Race;
  raceId: number;
  onBack: () => void;
};

export default function Race({ race, raceId, onBack }: Props) {
  const isDraft = race.status === "draft";
  const { data: students = [], isLoading, isError, error } = useStudents();

  const studentsById = useMemo(() => {
    return new Map(students.map((s) => [s.id, s]));
  }, [students]);

  const raceResultsByStudentId = useMemo(() => {
    return new Map(
      (race.raceResults ?? []).map((r) => [r.studentId, r])
    );
  }, [race.raceResults]);

  const lanes = useMemo(() => {
    return (race.laneAssignments ?? [])
      .slice()
      .sort((a, b) => a.laneNumber - b.laneNumber)
      .map((la) => ({
        ...la,
        student: studentsById.get(la.studentId) ?? null,
        result: raceResultsByStudentId.get(la.studentId) ?? null,
      }));
  }, [race.laneAssignments, studentsById, raceResultsByStudentId]);


  if (isLoading) return <div className="card">Loading…</div>;
  if (isError)
    return <div className="card">Error: {(error as Error)?.message}</div>;

  if(!isDraft) {
    return (
      <section className="stack stack--md">
        <div className="cluster cluster--between">
          <h1 style={{ margin: 0 }}>{race.name}</h1>
          <Button variant="primary" size="md" onClick={onBack}>
            ‹ Back
          </Button>
        </div>

        <div className="card">
          <h2 className="card__title">Race details</h2>
          <p className="card__meta">Status: {race.status.charAt(0).toUpperCase() + race.status.slice(1)}</p>

          <div className="stack stack--sm" style={{ marginTop: "1rem" }}>
            {lanes.length === 0 ? (
              <p className="card__meta">No lane assignments yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>Student</th>
                    <th>Place</th>
                  </tr>
                </thead>
                <tbody>
                  {lanes.map((lane) => (
                    <tr key={lane.id}>
                      <td className="table__lane">{lane.laneNumber}</td>

                      <td>
                        {lane.student ? (
                          `${lane.student.firstName} ${lane.student.lastName}`
                        ) : (
                          <span className="table__muted">Unknown student</span>
                        )}
                      </td>
                      <td>
                        {lane.result ? (
                          <div className={`table__place table__place--${lane.result.place}`}>
                            <p>
                              <strong>{lane.result.place}</strong>
                            </p>
                          </div>
                        ) : (
                          <span className="table__muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    );
  }

  return <RaceInlineEditor race={race} raceId={raceId} onBack={onBack} />;
}
