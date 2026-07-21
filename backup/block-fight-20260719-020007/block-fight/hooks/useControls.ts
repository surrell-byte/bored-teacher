'use client';

import { useEffect, useRef } from 'react';
import { JUMP_BUFFER_FRAMES } from '../systems/constants';
import { type ControlsState, type GameState } from '../systems/types';

const PREVENT_DEFAULT_KEYS = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];

export function useControls(
  stateRef: React.MutableRefObject<GameState | null>,
  onRestart: () => void,
) {
  const controlsRef = useRef<ControlsState>({
    left: false,
    right: false,
    jump: false,
    attack: false,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const controls = controlsRef.current;
      if (event.code === 'ArrowLeft') controls.left = true;
      if (event.code === 'ArrowRight') controls.right = true;
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        controls.jump = true;
        if (stateRef.current) stateRef.current.jumpBuffer = JUMP_BUFFER_FRAMES;
      }
      if (event.code === 'KeyX' || event.code === 'ShiftLeft') controls.attack = true;
      if (event.code === 'KeyR') onRestart();
      if (PREVENT_DEFAULT_KEYS.includes(event.code)) event.preventDefault();
    }

    function handleKeyUp(event: KeyboardEvent) {
      const controls = controlsRef.current;
      if (event.code === 'ArrowLeft') controls.left = false;
      if (event.code === 'ArrowRight') controls.right = false;
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        controls.jump = false;
        const player = stateRef.current?.player;
        if (player && player.vy < -6) player.vy *= 0.5;
      }
      if (event.code === 'KeyX' || event.code === 'ShiftLeft') controls.attack = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onRestart, stateRef]);

  return controlsRef;
}
