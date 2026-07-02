'use client';

import { useEffect } from 'react';
import { useGame } from '@/lib/gameState';

export default function AchievementPopup() {
  const { pendingAchievement, clearPendingAchievement } = useGame();

  useEffect(() => {
    if (!pendingAchievement) return;

    const timer = setTimeout(() => {
      clearPendingAchievement();
    }, 5000);

    return () => clearTimeout(timer);
  }, [pendingAchievement, clearPendingAchievement]);

  if (!pendingAchievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-bounce">
      <div className="bg-yellow-400 text-black rounded-2xl shadow-2xl p-5 max-w-sm border-4 border-yellow-600">
        <div className="text-2xl font-bold mb-2">
          🏆 Achievement Unlocked!
        </div>

        <div className="font-bold text-lg">
          {pendingAchievement.name}
        </div>

        <div className="text-sm opacity-80 mt-1">
          {pendingAchievement.description}
        </div>

        <button
          onClick={clearPendingAchievement}
          className="mt-4 bg-black text-white px-4 py-2 rounded-lg w-full"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}