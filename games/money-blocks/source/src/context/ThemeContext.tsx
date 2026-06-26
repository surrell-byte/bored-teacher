import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { ThemeKey, THEMES, applyThemeToDocument } from '../themes';
import { loadJSON, saveJSON } from '../services/storage';

export interface ThemeContextValue {
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>(() => loadJSON('theme', 'gold' as ThemeKey));

  useEffect(() => {
    applyThemeToDocument(THEMES[themeKey]);
    document.body.setAttribute('data-theme', themeKey);
    saveJSON('theme', themeKey);
  }, [themeKey]);

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey }}>{children}</ThemeContext.Provider>
  );
}

