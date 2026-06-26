import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../services/storage';

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: false,
};

export interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    loadJSON('settings', DEFAULT_SETTINGS)
  );

  useEffect(() => {
    saveJSON('settings', settings);
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...partial }));

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

