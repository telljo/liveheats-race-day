// frontend/src/components/Header.tsx
import ThemeSwitcher from "./ThemeSwitcher";
import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <span className="header__logo">🏁 Race Day</span>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
