'use client';

import { useEffect, useRef } from 'react';
import { drawBurger } from './burger-sprite';

interface BurgerSpriteProps {
  bun: string;
  size?: number;
  className?: string;
}

export default function BurgerSprite({ bun, size = 112, className }: BurgerSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, 80, 70);
    drawBurger(context, 16, 62, false, 0, false, bun);
  }, [bun]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={70}
      role="img"
      aria-label={`${bun} pixel burger`}
      className={className}
      style={{ width: size, height: size * 0.875, imageRendering: 'pixelated' }}
    />
  );
}
