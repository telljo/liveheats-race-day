import React, { useState } from "react";
import Button from "../../components/Button";
import { useCreateStudent, useStudents } from "../../hooks/useStudents";
import { CreateStudentParams } from "../../types/Student";

type Props = {
  onCancel: () => void;
};

export default function NewStudent({ onCancel }: Props) {
  const createStudentMutation = useCreateStudent();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  async function handleSave() {
    const studentPayload: CreateStudentParams = {
      first_name: firstName.trim(),
      last_name: lastName.trim()
    };

    createStudentMutation.mutate(studentPayload, {
      onSuccess: () => {
        window.location.href = `/students/`;
      },
    });
  }

  return (
    <div className="card stack stack--md">
      <label>
        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>First name</div>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Harry"
          className="input"
        />
      </label>

      <label>
        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Last name</div>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Potter"
          className="input"
        />
      </label>

      <div className="cluster cluster--between">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="md"
          disabled={createStudentMutation.isPending}
          onClick={handleSave}
        >
          Create Student
        </Button>
      </div>
    </div>
  );
}
