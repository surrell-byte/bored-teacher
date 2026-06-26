import React from 'react';
import { THEME_LIST } from '../../themes';
import { useTheme } from '../../hooks/useTheme';

/** Row of clickable swatches that let the player switch the table's theme. */
export function ThemeSelector() {
  const { themeKey, setThemeKey } = useTheme();

  return (
    <div className="theme-picker">
      <span className="theme-picker-label">Table</span>
      <div className="theme-swatches">
        {THEME_LIST.map((theme) => (
          <button
            key={theme.key}
            type="button"
            className={`theme-swatch ${themeKey === theme.key ? 'active' : ''}`}
            style={{ background: theme.goldBright, borderColor: theme.goldDeep }}
            data-name={theme.key[0].toUpperCase() + theme.key.slice(1)}
            aria-label={`Switch to ${theme.key} theme`}
            aria-pressed={themeKey === theme.key}
            onClick={() => setThemeKey(theme.key)}
          />
        ))}
      </div>
    </div>
  );
}
