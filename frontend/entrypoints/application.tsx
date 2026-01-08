// app/frontend/entrypoints/application.tsx
import React from "react"
import { createRoot } from "react-dom/client"
import "../styles/application.scss";
import App from "../App";

const container = document.getElementById("app");

if (container) {
  createRoot(container).render(<App />);
}
