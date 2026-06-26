import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { GameProvider } from './context/GameContext';
import { Game } from './pages/Game';
import { preloadThemeBackgrounds, preloadSounds } from './services/preload';

export function App() {
  useEffect(() => {
    preloadThemeBackgrounds();
    preloadSounds();
  }, []);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <GameProvider>
          <div className="app">
            <Game />
          </div>
        </GameProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
