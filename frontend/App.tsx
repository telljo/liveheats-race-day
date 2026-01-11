import React from "react";
import Header from "./components/Header";
import RaceListPage from "./features/races/RaceListPage";
import { Page, PAGES } from "./routing/Pages";
import { Toaster } from "react-hot-toast";
import ShowRacePage from "./features/races/ShowRacePage";
import NewRacePage from "./features/races/NewRacePage";

type Props = {
  page: Page;
  raceId?: string;
};

function renderPage(page: Page, raceId?: string) {
  switch (page) {
    case PAGES.raceShow:
      return raceId ? <ShowRacePage raceId={raceId} /> : <RaceListPage />;
    case PAGES.raceNew:
      return <NewRacePage />;
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
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          }
        }}
      />
    </>
  );
}
