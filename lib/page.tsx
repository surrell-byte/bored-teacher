'use client';

import { useGame } from '@/lib/gameState';

export default function StatsPage() {
  const { state } = useGame();

  const games = Object.values(state.games);

  const totalGames = games.reduce(
    (sum, g) => sum + g.completions,
    0
  );

  const highestScore = Math.max(
    ...games.map(g => g.highScore),
    0
  );

  const avgAccuracy =
    games.length > 0
      ? games.reduce((sum, g) => sum + g.lastAccuracy, 0) / games.length
      : 0;

  return (
    <main className="max-w-4xl mx-auto p-6">

      <h1 className="text-4xl font-bold mb-8">
        📊 Statistics
      </h1>

      <div className="grid md:grid-cols-2 gap-4">

        <Stat
          label="Games Played"
          value={totalGames}
        />

        <Stat
          label="Highest Score"
          value={highestScore}
        />

        <Stat
          label="Average Accuracy"
          value={`${avgAccuracy.toFixed(1)}%`}
        />

        <Stat
          label="Level"
          value={state.level}
        />

        <Stat
          label="Coins"
          value={state.coins}
        />

      </div>

    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-black">
      <div className="text-gray-500">
        {label}
      </div>

      <div className="text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}