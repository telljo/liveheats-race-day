// frontend/src/App.tsx
import React from "react";
import Header from "./components/Header";
import RaceShowPage from "./features/races/RaceShowPage";
import RaceListPage from "./features/races/RaceListPage";
import RaceNewPage from "./features/races/RaceNewPage";
import { Page, PAGES } from "./routing/Pages";

type Props = {
  page: Page;
  raceId?: string;
};

function renderPage(page: Page, raceId?: string) {
  switch (page) {
    case PAGES.raceShow:
      return raceId ? <RaceShowPage raceId={raceId} /> : <RaceListPage />;
    case PAGES.raceNew:
      return <RaceNewPage />;
    case PAGES.racesIndex:
    default:
      return <RaceListPage />;
  }
}

export default function App({ page, raceId }: Props) {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          {
            renderPage(page, raceId)
          }
        </div>
      </main>
    </>
  );
}
