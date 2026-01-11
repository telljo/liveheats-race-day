export const PAGES = {
  racesIndex: "races-index",
  raceShow: "race-show",
  raceNew: "race-new",
  studentsIndex: "students-index",
  studentNew: "student-new"
} as const;

export type Page = typeof PAGES[keyof typeof PAGES];
