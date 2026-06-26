import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import './styles/globals.css';
import './styles/animations.css';
import './styles/components/board.css';
import './styles/components/block.css';
import './styles/components/hud.css';
import './styles/components/scoreboard.css';
import './styles/components/theme-selector.css';
import './styles/components/screens.css';
import './styles/components/htp-modal.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
