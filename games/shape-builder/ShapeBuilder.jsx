'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f1c', '#00cec9', '#fd79a8'];
const shapeNames = { triangle: 'triangles', rectangle: 'rectangles', circle: 'circles', square: 'squares' };
const shapeEmojis = { triangle: '🔺', rectangle: '🟦', circle: '⭕', square: '🟥' };

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ShapeBuilder({ onComplete }) {
  const canvasRef = useRef(null);
  const [selectedShape, setSelectedShape] = useState('triangle');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(40);
  const [shapes, setShapes] = useState([]);
  const [score, setScore] = useState(0);
  const [questionShape, setQuestionShape] = useState('triangle');
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');

  const counts = useMemo(() => {
    const result = { triangle: 0, rectangle: 0, circle: 0, square: 0 };
    shapes.forEach((shape) => { result[shape.type] += 1; });
    return result;
  }, [shapes]);

  useEffect(() => {
    drawShapes();
  }, [shapes]);

  useEffect(() => {
    buildChoices(questionShape, counts[questionShape]);
  }, [questionShape, counts]);

  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((shape) => {
      ctx.fillStyle = shape.color;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
      } else if (shape.type === 'triangle') {
        ctx.moveTo(shape.x, shape.y - shape.size * 0.6);
        ctx.lineTo(shape.x - shape.size * 0.5, shape.y + shape.size * 0.4);
        ctx.lineTo(shape.x + shape.size * 0.5, shape.y + shape.size * 0.4);
        ctx.closePath();
      } else if (shape.type === 'rectangle') {
        ctx.rect(shape.x - shape.size * 0.7, shape.y - shape.size * 0.4, shape.size * 1.4, shape.size * 0.8);
      } else {
        ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
      }

      ctx.fill();
      ctx.stroke();
    });
  };

  const addShape = (x, y) => {
    setShapes((current) => [...current, { type: selectedShape, x, y, size: selectedSize, color: selectedColor }]);
  };

  const newQuestion = () => {
    const types = Object.keys(shapeNames);
    const nextShape = types[randomBetween(0, types.length - 1)];
    setQuestionShape(nextShape);
    setQuestionAnswered(false);
    setFeedback('');
    buildChoices(nextShape, counts[nextShape]);
  };

  const buildChoices = (shape, correct) => {
    const buttons = document.getElementById('shape-builder-count-choices');
    if (!buttons) return;
    buttons.innerHTML = '';

    const options = new Set([correct]);
    while (options.size < 4) {
      const candidate = Math.max(0, correct + randomBetween(-2, 2));
      options.add(candidate);
    }

    [...options].sort(() => Math.random() - 0.5).forEach((value, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shape-builder-count-button';
      button.textContent = String(value);
      button.style.background = ['#ffd93d', '#6bcb77', '#4d96ff', '#ff9f1c'][index % 4];
      button.onclick = () => checkCount(value, correct);
      buttons.appendChild(button);
    });
  };

  const checkCount = (value, correct) => {
    if (questionAnswered) return;
    if (value === correct) {
      setQuestionAnswered(true);
      setScore((current) => current + 10);
      setFeedback('🎉 Correct! Great counting!');
      onComplete?.(score + 10, 100);
      return;
    }

    setFeedback('🤔 Count again!');
  };

  const undoLast = () => {
    setShapes((current) => current.slice(0, -1));
  };

  const clearAll = () => {
    setShapes([]);
    setFeedback('');
  };

  return (
    <main className="shape-builder-game">
      <style>{STYLES}</style>
      <div className="shape-builder-shell">
        <h1>🔷 Shape Builder!</h1>
        <div className="shape-builder-top">
          <div className="shape-builder-stat">⭐ Score: <span>{score}</span></div>
          <div className="shape-builder-stat">🎨 Shapes placed: <span>{shapes.length}</span></div>
        </div>

        <div className="shape-builder-layout">
          <div className="shape-builder-toolbar">
            <div className="shape-builder-toolbar-label">Shape:</div>
            {Object.keys(shapeNames).map((shape) => (
              <button key={shape} type="button" className={`shape-builder-shape-button ${selectedShape === shape ? 'active' : ''}`} onClick={() => setSelectedShape(shape)}>
                {shapeEmojis[shape]} {shape.charAt(0).toUpperCase() + shape.slice(1)}
              </button>
            ))}

            <div className="shape-builder-toolbar-label">Color:</div>
            <div className="shape-builder-color-row">
              {colors.map((color) => (
                <button key={color} type="button" className={`shape-builder-color-swatch ${selectedColor === color ? 'active' : ''}`} style={{ background: color }} onClick={() => setSelectedColor(color)} aria-label={`Select color ${color}`} />
              ))}
            </div>

            <div className="shape-builder-toolbar-label">Size:</div>
            <input type="range" min="20" max="70" value={selectedSize} onChange={(event) => setSelectedSize(Number(event.target.value))} style={{ width: '100%', accentColor: '#7209b7' }} />
          </div>

          <div className="shape-builder-canvas-wrap">
            <canvas ref={canvasRef} width="360" height="320" onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = (event.clientX - rect.left) * (canvasRef.current.width / rect.width);
              const y = (event.clientY - rect.top) * (canvasRef.current.height / rect.height);
              addShape(x, y);
            }} />
          </div>

          <div className="shape-builder-question-panel">
            <div id="question-text" className="shape-builder-question-text">How many {shapeEmojis[questionShape]} {shapeNames[questionShape]}?</div>
            <div id="shape-builder-count-choices" className="shape-builder-count-choices" />
            <div className="shape-builder-feedback">{feedback}</div>
            <div className="shape-builder-counter">
              {Object.entries(counts)
                .filter(([, value]) => value > 0)
                .map(([type, value]) => (
                  <div key={type} className="shape-builder-count-chip">{shapeEmojis[type]} {value}</div>
                ))}
            </div>
            <div className="shape-builder-controls">
              <button type="button" className="shape-builder-control undo" onClick={undoLast}>↩ Undo</button>
              <button type="button" className="shape-builder-control clear" onClick={clearAll}>🗑️ Clear</button>
              <button type="button" className="shape-builder-control new" onClick={newQuestion}>❓ New Q</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const STYLES = `
.shape-builder-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0d0221 0%, #1a0545 50%, #2d0a6e 100%);
  color: white;
  font-family: 'Nunito', var(--font-body), sans-serif;
}
.shape-builder-shell {
  width: min(100%, 1100px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 10px 24px;
}
.shape-builder-shell h1 {
  margin: 0 0 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2rem, 3vw, 2.8rem);
  text-shadow: 2px 2px 0 #7209b7, 0 0 20px rgba(255,230,109,0.4);
}
.shape-builder-top {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.shape-builder-stat {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 6px 16px;
  color: #ffe66d;
}
.shape-builder-layout {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.shape-builder-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 110px;
}
.shape-builder-toolbar-label {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 0.9rem;
  color: #c8b6ff;
  margin-top: 6px;
}
.shape-builder-shape-button {
  appearance: none;
  border: 3px solid transparent;
  border-radius: 14px;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
  color: white;
  background: rgba(255,255,255,0.12);
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
}
.shape-builder-shape-button.active {
  background: rgba(255,255,255,0.25);
  border-color: white;
}
.shape-builder-color-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.shape-builder-color-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.15s ease;
}
.shape-builder-color-swatch.active {
  border-color: white;
  transform: scale(1.2);
}
.shape-builder-canvas-wrap {
  position: relative;
}
.shape-builder-canvas-wrap canvas {
  border-radius: 16px;
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.2);
  cursor: crosshair;
  touch-action: none;
}
.shape-builder-question-panel {
  background: linear-gradient(135deg, rgba(114,9,183,0.5), rgba(58,12,163,0.5));
  border: 2px solid #7209b7;
  border-radius: 20px;
  padding: 14px 16px;
  text-align: center;
  min-width: 220px;
}
.shape-builder-question-text {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  color: #ffe66d;
  margin-bottom: 12px;
}
.shape-builder-count-choices {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.shape-builder-count-button {
  appearance: none;
  border: none;
  border-radius: 14px;
  padding: 8px 18px;
  cursor: pointer;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.2rem;
}
.shape-builder-feedback {
  font-size: 1.2rem;
  font-weight: 900;
  min-height: 1.8rem;
  margin-top: 10px;
  text-align: center;
}
.shape-builder-counter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  justify-content: center;
}
.shape-builder-count-chip {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 0.95rem;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 3px 10px;
}
.shape-builder-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.shape-builder-control {
  appearance: none;
  border: none;
  border-radius: 20px;
  padding: 8px 14px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  cursor: pointer;
}
.shape-builder-control.undo { background: #ff6b6b; color: white; }
.shape-builder-control.clear { background: rgba(255,255,255,0.15); color: white; }
.shape-builder-control.new { background: linear-gradient(135deg,#7209b7,#3a0ca3); color: white; }
`;
