// frontend/src/App.tsx
import React from "react";
import Header from "./components/Header";
import RaceShowPage from "./features/races/RaceShowPage";
import RaceListPage from "./features/races/RaceListPage";

type Props = {
  page: string;
  raceId?: string;
};

export default function App({ page, raceId }: Props) {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          {page === "race-show" && raceId ? (
            <RaceShowPage raceId={raceId} />
          ) : (
            <RaceListPage />
          )}
        </div>
      </main>
    </>
    // <>
    //   <Header />

    //   <main className="page">
    //     <div className="container">
    //       <RaceList
    //         races={races}
    //         onCreateRace={() => alert("Create race (next step)")}
    //         onOpenRace={(id) => alert(`Open race ${id} (next step)`)}
    //       />
    //     </div>
    //   </main>
    // </>
  );
}
