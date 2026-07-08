'use client';

import { useGame } from '@/providers/GameProvider';

export default function Toast() {
  const { toast } = useGame();

  return (
    <div className={`toast${toast ? ' show' : ''}`} aria-live="polite" aria-atomic>
      {toast}
    </div>
  );
}
