import React from "react";
import Button from "../../components/Button";
import NewStudent from "./NewStudent";

export default function NewStudentPage() {
  return (
    <section className="stack stack--md">
      <div className="cluster cluster--between">
        <h1 style={{ margin: 0 }}>New Student</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => (window.location.href = "/students")}
        >
          ‹ Back
        </Button>
      </div>

      <NewStudent onCancel={() => (window.location.href = "/students")} />
    </section>
  );
}
