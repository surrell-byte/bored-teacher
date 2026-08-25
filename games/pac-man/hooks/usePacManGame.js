import { useCallback, useEffect, useRef, useState } from 'react';
import { createGameState } from '../game/gameState';
import { updateGame } from '../game/gameUpdate';
import { renderGame } from '../game/gameRenderer';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_PHASES } from '../game/constants';

export function usePacManGame({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [ui, setUi] = useState({ score: 0, lives: 3, phase: GAME_PHASES.PLAYING });

  const syncUi = useCallback((game) => setUi({ score: game.score, lives: game.lives, phase: game.phase }), []);
  const handleKey = useCallback((event) => {
    const game = gameRef.current;
    if (!game || game.phase !== GAME_PHASES.PLAYING) return;
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = directions[event.key];
    if (!direction) return;
    [game.player.nextDx, game.player.nextDy] = direction;
    event.preventDefault();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    gameRef.current = createGameState();
    let animationFrame;
    let lastUiKey = '';

    const loop = () => {
      const game = gameRef.current;
      if (!game) return;
      updateGame(game); renderGame(ctx, game);
      const uiKey = `${game.score}:${game.lives}:${game.phase}`;
      if (uiKey !== lastUiKey) { lastUiKey = uiKey; syncUi(game); }
      animationFrame = requestAnimationFrame(loop);
    };
    window.addEventListener('keydown', handleKey);
    loop();
    return () => { cancelAnimationFrame(animationFrame); window.removeEventListener('keydown', handleKey); };
  }, [handleKey, syncUi]);

  useEffect(() => {
    if (ui.phase === GAME_PHASES.WIN || ui.phase === GAME_PHASES.GAME_OVER) {
      const game = gameRef.current;
      onComplete?.(ui.score, game ? Math.round((game.eaten / game.totalPellets) * 100) : 0);
    }
  }, [onComplete, ui.phase, ui.score]);

  const restart = useCallback(() => {
    const game = createGameState();
    gameRef.current = game;
    setUi({ score: 0, lives: 3, phase: GAME_PHASES.PLAYING });
  }, []);

  return { canvasRef, ui, restart };
}
