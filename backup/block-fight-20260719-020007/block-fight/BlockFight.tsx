'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameLayout } from '@/engine';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { PLATFORMS } from './data/levels';
import { updateEffects } from './systems/effects';
import { drawGame } from './systems/rendering';
import { createInitialState, createInitialUi } from './systems/spawning';
import { type GameState, type GameUi } from './systems/types';
import { updateCollectibles, updateWinCondition } from './hooks/useCollision';
import { useControls } from './hooks/useControls';
import { updateEnemies } from './hooks/useEnemies';
import { updatePhysics } from './hooks/usePhysics';

type BlockFightProps = {
  onComplete?: (score: number, accuracy: number) => void;
};

export default function BlockFight({ onComplete }: BlockFightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const [ui, setUi] = useState<GameUi>(createInitialUi);

    const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setUi(createInitialUi());
  }, []);

  const controlsRef = useControls(stateRef, restart);

  // Report the result back to the game page once the run ends.
  useEffect(() => {
    if (ui.state === 'win') onComplete?.(ui.score, 100);
    else if (ui.state === 'dead') onComplete?.(ui.score, 0);
  }, [ui.state, ui.score, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const ctx: CanvasRenderingContext2D = context;

    let animationId = 0;
    stateRef.current = createInitialState();

    function update() {
      const state = stateRef.current;
      if (!state || state.gameState !== 'playing') return;

      // Freeze the whole simulation for a few frames on impact — this is what gives hits "weight".
      if (state.hitStop > 0) {
        state.hitStop -= 1;
        return;
      }

      updatePhysics(state, controlsRef.current, PLATFORMS, setUi);
      if (state.gameState !== 'playing') return;

      updateEnemies(state, PLATFORMS, setUi);
      updateCollectibles(state, setUi);
      updateWinCondition(state, setUi);
      updateEffects(state);
    }

    function loop() {
      const state = stateRef.current;
      if (state) {
        update();
        drawGame(ctx, state, PLATFORMS);
      }
      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [controlsRef]);

  return (
    <GameLayout
      header={<HUD score={ui.score} hp={ui.hp} />}
      controls={
        <p style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          ← → Move &nbsp;·&nbsp; ↑ / Space Jump &nbsp;·&nbsp; X / Shift Attack &nbsp;·&nbsp; R Restart
        </p>
      }
    >
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#020617', fontFamily: "'Segoe UI', sans-serif", padding: 16, borderRadius: 12,
      }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={424}
            style={{ border: '2px solid #1e293b', borderRadius: 12, display: 'block', maxWidth: '100%', height: 'auto' }}
          />

          {ui.state !== 'playing' && (
            <GameOver score={ui.score} state={ui.state} onRestart={restart} />
          )}
        </div>
      </div>
    </GameLayout>
  );
}
