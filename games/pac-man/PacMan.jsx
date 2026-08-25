import { useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { usePacManGame } from './hooks/usePacManGame';
import { PacManHUD } from './components/PacManHUD';
import { PacManCanvas } from './components/PacManCanvas';
import './styles/pacman.css';

export default function PacMan({ onComplete }) {
  const [best, setBest] = useStorage('pacman-high-score', 0);
  const { canvasRef, ui, restart } = usePacManGame({ onComplete });

  useEffect(() => {
    if (ui.score > best) setBest(ui.score);
  }, [best, setBest, ui.score]);

  return (
    <div className="pacman">
      <PacManHUD score={ui.score} lives={ui.lives} />
      <PacManCanvas canvasRef={canvasRef} phase={ui.phase} score={ui.score} onRestart={restart} />
      <p className="pacman-best">Best: {best}</p>
    </div>
  );
}
