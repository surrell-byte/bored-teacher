'use client';

import { useEffect, useState } from 'react';
import { applyGameSettings, getGameSettings, saveGameSettings, type GameSettings } from '@/lib/game-settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const next = getGameSettings();
    setSettings(next);
    applyGameSettings(next);
  }, []);

  const updateSetting = (key: keyof GameSettings, value: number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveGameSettings(next);
  };

  return (
    <div className="settings-page shell-card" style={{ margin: '24px auto', maxWidth: 760, padding: 'clamp(20px, 4vw, 32px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <p className="suggestions-kicker">Game controls</p>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontFamily: 'var(--font-display, Syne)', letterSpacing: '.03em' }}>Settings</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div className="shell-card" style={{ padding: 18 }}>
          <label htmlFor="volume" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: 10 }}>
            <span>🔊 Volume</span>
            <span>{settings.volume}%</span>
          </label>
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={event => updateSetting('volume', Number(event.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="shell-card" style={{ padding: 18 }}>
          <label htmlFor="brightness" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: 10 }}>
            <span>☀️ Brightness</span>
            <span>{settings.brightness}%</span>
          </label>
          <input
            id="brightness"
            type="range"
            min={40}
            max={200}
            value={settings.brightness}
            onChange={event => updateSetting('brightness', Number(event.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SETTINGS: GameSettings = {
  volume: 70,
  brightness: 100,
};
