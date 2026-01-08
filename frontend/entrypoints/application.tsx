// app/frontend/entrypoints/application.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App";
import "../styles/application.scss";


const container = document.getElementById("app");

if (container) {
  const page = container.dataset.page || "races-index";
  const raceId = container.dataset.raceId;

  createRoot(container).render(<App page={page} raceId={raceId} />);
}
