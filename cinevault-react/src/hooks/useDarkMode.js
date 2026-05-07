import { useState, useEffect } from "react";

/**
 * useDarkMode — persists preference in localStorage.
 * Applies / removes the "dark" class on <html>.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("cv-dark-mode");
      if (stored !== null) return stored === "true";
      // Respect OS preference on first visit
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem("cv-dark-mode", dark); } catch {}
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return { dark, toggle };
}
