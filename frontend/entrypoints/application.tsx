// app/frontend/entrypoints/application.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App";
import "../styles/application.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../api/queryClient";
import { Page } from "../routing/Pages";

const container = document.getElementById("app");

if (container) {
  const page = container.dataset.page || "races-index";
  const raceId = container.dataset.raceId;

  createRoot(container).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App page={page as Page} raceId={raceId} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}