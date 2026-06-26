import { useCallback } from 'react';
import { playSound, SoundId } from '../services/audio';
import { useSettings } from './useSettings';

export function useAudio() {
  const { settings } = useSettings();

  const play = useCallback(
    (id: SoundId) => {
      if (settings.soundEnabled) playSound(id);
    },
    [settings.soundEnabled]
  );

  return { play };
}

