import { useEffect, useState } from "react";
import Button from "./Button";
import React from "react";

type Theme = "light" | "dark";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <Button onClick={toggleTheme} variant="primary" size="md">
      {theme === "light" ? "🌙" : "☀️"}
    </Button>
  );
}
