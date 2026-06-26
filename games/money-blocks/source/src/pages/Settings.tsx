import React from 'react';
import { useSettings } from '../hooks/useSettings';

/**
 * Placeholder settings page. Not currently routed to — sound/music toggles
 * already live in `SettingsContext` and are read via `useSettings()`; this
 * page just exposes them in case a dedicated settings screen is added later.
 */
export function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="screen-overlay">
      <div className="setup-box">
        <div className="setup-header">
          <div className="setup-eyebrow">Private Table</div>
          <h2 className="setup-title">Settings</h2>
        </div>
        <div className="setup-player">
          <label className="setup-player-label">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />{' '}
            Sound effects
          </label>
          <label className="setup-player-label">
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
            />{' '}
            Music
          </label>
        </div>
      </div>
    </div>
  );
}
