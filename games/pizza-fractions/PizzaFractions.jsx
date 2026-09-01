'use client';

import { useMemo, useState } from 'react';

const toppingDefs = [
  { name: 'Cheese', emoji: '🧀', color: '#ffd93d' },
  { name: 'Pepperoni', emoji: '🔴', color: '#c0392b' },
  { name: 'Mushrooms', emoji: '🍄', color: '#8b5e3c' },
  { name: 'Peppers', emoji: '🌶️', color: '#27ae60' },
];

const fractions = [{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 3 }, { n: 2, d: 3 }, { n: 3, d: 8 }, { n: 5, d: 8 }];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrders() {
  const numToppings = Math.random() < 0.4 ? 2 : 1;
  const shuffled = [...toppingDefs].sort(() => Math.random() - 0.5).slice(0, numToppings);

  if (numToppings === 1) {
    const fraction = fractions[randomBetween(0, fractions.length - 1)];
    return { slices: fraction.d, orders: [{ topping: shuffled[0], n: fraction.n, d: fraction.d }] };
  }

  return {
    slices: 4,
    orders: [
      { topping: shuffled[0], n: 1, d: 4 },
      { topping: shuffled[1], n: 3, d: 4 },
    ],
  };
}

export default function PizzaFractions({ onComplete }) {
  const [score, setScore] = useState(0);
  const [orders, setOrders] = useState(() => generateOrders());
  const [activeToppingIndex, setActiveToppingIndex] = useState(0);
  const [sliceAssignments, setSliceAssignments] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [nextVisible, setNextVisible] = useState(false);

  const selectedCounts = useMemo(() => {
    const counts = orders.orders.map((_, index) => sliceAssignments.filter((value) => value === index).length);
    return counts.join(' + ');
  }, [orders.orders, sliceAssignments]);

  const nextOrder = () => {
    const fresh = generateOrders();
    setOrders(fresh);
    setActiveToppingIndex(0);
    setSliceAssignments(Array(fresh.slices).fill(null));
    setFeedback('');
    setNextVisible(false);
  };

  const toggleSlice = (index) => {
    setSliceAssignments((current) => {
      const next = [...current];
      const currentValue = next[index];
      if (currentValue === null) {
        next[index] = activeToppingIndex;
      } else if (currentValue === activeToppingIndex) {
        next[index] = null;
      } else {
        next[index] = activeToppingIndex;
      }
      return next;
    });
  };

  const checkAnswer = () => {
    let isCorrect = true;
    orders.orders.forEach((order, index) => {
      const got = sliceAssignments.filter((value) => value === index).length;
      const expected = Math.round((order.n / order.d) * orders.slices);
      if (got !== expected) isCorrect = false;
    });

    if (isCorrect) {
      const nextScore = score + 15;
      setScore(nextScore);
      setFeedback('🎉 Perfect pizza! The customer is happy!');
      setNextVisible(true);
      onComplete?.(nextScore, 100);
      return;
    }

    setFeedback('🤔 Not quite right! Check the fractions!');
  };

  return (
    <main className="pizza-fractions-game">
      <style>{STYLES}</style>
      <div className="pizza-fractions-shell">
        <h1>🍕 Pizza Fractions!</h1>

        <div className="pizza-fractions-order-box">
          <div className="pizza-fractions-order-text">Customer wants: {orders.orders.map((order) => `${order.n}/${order.d} ${order.topping.emoji} ${order.topping.name}`).join(' + ')}</div>
          <div className="pizza-fractions-order-sub">Click the correct slices, then press Check!</div>
        </div>

        <div className="pizza-fractions-main">
          <div className="pizza-fractions-pizza-container">
            <svg className="pizza-fractions-pizza" viewBox="0 0 240 240" width="240" height="240">
              {Array.from({ length: orders.slices }, (_, index) => {
                const start = (index / orders.slices) * Math.PI * 2 - Math.PI / 2;
                const end = ((index + 1) / orders.slices) * Math.PI * 2 - Math.PI / 2;
                const cx = 120;
                const cy = 120;
                const r = 110;
                const x1 = cx + r * Math.cos(start);
                const y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end);
                const y2 = cy + r * Math.sin(end);
                const fill = sliceAssignments[index] === null ? 'transparent' : orders.orders[sliceAssignments[index]].topping.color + 'bb';

                return (
                  <g key={`slice-${index}`}>
                    <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={fill} stroke="#8b6914" strokeWidth="2" onClick={() => toggleSlice(index)} style={{ cursor: 'pointer' }} />
                    <text x={cx + (r * 0.58) * Math.cos((start + end) / 2)} y={cy + (r * 0.58) * Math.sin((start + end) / 2)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="14" fontFamily="Fredoka One, cursive">
                      {index + 1}
                    </text>
                  </g>
                );
              })}
              <circle cx="120" cy="120" r="110" fill="#c8860a" />
              <circle cx="120" cy="120" r="102" fill="#f0c040" />
              <circle cx="120" cy="120" r="84" fill="#c0392b" />
            </svg>
            <div className="pizza-fractions-info-panel">Selected: <strong>{selectedCounts}</strong> / {orders.slices} slices</div>
          </div>

          <div className="pizza-fractions-toppings-panel">
            <div className="pizza-fractions-label">🎨 Choose topping:</div>
            {orders.orders.map((order, index) => (
              <button key={`${order.topping.name}-${index}`} type="button" className={`pizza-fractions-button ${index === activeToppingIndex ? 'active' : ''}`} style={{ background: `${order.topping.color}cc` }} onClick={() => setActiveToppingIndex(index)}>
                {order.topping.emoji} {order.topping.name}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="pizza-fractions-check" onClick={checkAnswer}>Check Pizza ✅</button>
        <div className="pizza-fractions-feedback">{feedback}</div>
        <div className="pizza-fractions-score-row">⭐ Score: <span>{score}</span></div>
        {nextVisible && <button type="button" className="pizza-fractions-next" onClick={nextOrder}>Next Order! 🍕</button>}
      </div>
    </main>
  );
}

const STYLES = `
.pizza-fractions-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #8b0000 100%);
  color: white;
  font-family: 'Nunito', var(--font-body), sans-serif;
}
.pizza-fractions-shell {
  width: min(100%, 760px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px 28px;
  text-align: center;
}
.pizza-fractions-shell h1 {
  margin: 0 0 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffd700;
  font-size: clamp(2.2rem, 3vw, 2.8rem);
  text-shadow: 2px 2px 0 #8b0000;
}
.pizza-fractions-order-box {
  background: rgba(255,255,255,0.1);
  border: 2px solid #ffd700;
  border-radius: 20px;
  padding: 12px 18px;
  margin-bottom: 18px;
}
.pizza-fractions-order-text {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  color: #ffd700;
}
.pizza-fractions-order-sub {
  font-size: 0.95rem;
  color: #ffc;
  margin-top: 4px;
}
.pizza-fractions-main {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.pizza-fractions-pizza-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.pizza-fractions-pizza {
  cursor: pointer;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
}
.pizza-fractions-info-panel {
  background: rgba(0,0,0,0.4);
  border-radius: 16px;
  padding: 10px 14px;
  font-size: 1rem;
  color: #ffc;
  min-width: 200px;
}
.pizza-fractions-info-panel strong {
  color: #ffd700;
  font-size: 1.2rem;
}
.pizza-fractions-toppings-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 150px;
}
.pizza-fractions-label {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1rem;
  color: #ffc;
  margin-bottom: 4px;
}
.pizza-fractions-button {
  appearance: none;
  border: none;
  border-radius: 14px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.1rem;
  color: white;
}
.pizza-fractions-button.active {
  outline: 3px solid white;
  transform: scale(1.08);
}
.pizza-fractions-check,
.pizza-fractions-next {
  appearance: none;
  border: none;
  border-radius: 30px;
  padding: 10px 26px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.3rem;
  cursor: pointer;
  margin-top: 12px;
}
.pizza-fractions-check {
  background: linear-gradient(135deg,#ffd700,#ff8c00);
  color: #3d1c00;
}
.pizza-fractions-next {
  background: linear-gradient(135deg,#6be585,#2ecc71);
  color: #1b5e20;
}
.pizza-fractions-feedback {
  font-size: 1.4rem;
  font-weight: 900;
  min-height: 2rem;
  margin-top: 8px;
  text-align: center;
}
.pizza-fractions-score-row {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.2rem;
  color: #ffd700;
  margin-top: 8px;
}
`;
