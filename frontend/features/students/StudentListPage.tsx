import React from "react";
import StudentList from "./StudentList";

export default function StudentListPage() {

  return (
    <StudentList
      onCreateStudent={() => (window.location.href = `/students/new`)}
    />
  );
}
