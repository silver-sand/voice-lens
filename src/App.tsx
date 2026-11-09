"use client";

import { Routes } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { FocusModeProvider } from "./providers/FocusModeProvider";

export function App() {
  return (
    <ThemeProvider>
      <FocusModeProvider>
        <Routes />
      </FocusModeProvider>
    </ThemeProvider>
  );
}