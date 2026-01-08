// frontend/src/App.tsx
import React from "react";
import Header from "./components/Header";

export default function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "1rem" }}>
        <h1>Race Day</h1>
        {/* races UI will go here */}
      </main>
    </>
  );
}
