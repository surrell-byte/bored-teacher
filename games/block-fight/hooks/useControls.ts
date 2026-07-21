'use client';

import { useEffect, useRef } from 'react';
import { DASH_BUFFER_FRAMES, JUMP_BUFFER_FRAMES } from '../systems/constants';
import { type ControlsState, type GameState } from '../systems/types';

const PREVENT_DEFAULT_KEYS = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyC'];

export function useControls(
  stateRef: React.MutableRefObject<GameState | null>,
  onRestart: () => void,
) {
  const controlsRef = useRef<ControlsState>({
    left: false,
    right: false,
    jump: false,
    attack: false,
    dash: false,
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
      // Guard on the flag itself so OS key-repeat (held key firing keydown
      // repeatedly) can't refill the dash buffer every frame and spam-dash
      // the instant the cooldown clears — only the first press counts.
      if (event.code === 'KeyC' && !controls.dash) {
        controls.dash = true;
        if (stateRef.current) stateRef.current.dashBuffer = DASH_BUFFER_FRAMES;
      }
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
      if (event.code === 'KeyC') controls.dash = false;
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
