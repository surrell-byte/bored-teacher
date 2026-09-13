'use client';

import { useState, useCallback } from 'react';

const TOPPING_COLORS = { Cheese: '#ffd93d', Pepperoni: '#c0392b', Mushrooms: '#8b5e3c', Peppers: '#27ae60', Corn: '#e5b82e', Olives: '#526b2f', Pineapple: '#f4c542' };
const QUESTION_BANK = [
  ['Customer wants: 1/4 🍅 Pepperoni + 3/4 🫑 Peppers', [['Peppers', '🌶️', 3], ['Pepperoni', '🔴', 1]]],
  ['Customer wants: 1/4 🔴 Pepperoni + 3/4 🧀 Cheese', [['Cheese', '🧀', 3], ['Pepperoni', '🔴', 1]]],
  ['Customer wants: 1/4 🌽 Corn + 3/4 🍄 Mushrooms', [['Corn', '🌽', 1], ['Mushrooms', '🍄', 3]]],
  ['Customer wants: 1/4 🫒 Olives + 3/4 🧀 Cheese', [['Olives', '🫒', 1], ['Cheese', '🧀', 3]]],
  ['Customer wants: 1/4 🍍 Pineapple + 3/4 🔴 Pepperoni', [['Pineapple', '🍍', 1], ['Pepperoni', '🔴', 3]]],
  ['Customer wants: 1/2 🫑 Peppers + 1/2 🔴 Pepperoni', [['Peppers', '🌶️', 2], ['Pepperoni', '🔴', 2]]],
  ['Customer wants: 1/2 🧀 Cheese + 1/2 🍄 Mushrooms', [['Cheese', '🧀', 2], ['Mushrooms', '🍄', 2]]],
  ['Customer wants: 1/2 🔴 Pepperoni + 1/4 🫒 Olives + 1/4 🌽 Corn', [['Pepperoni', '🔴', 2], ['Olives', '🫒', 1], ['Corn', '🌽', 1]]],
  ['Customer wants: 1/2 🍄 Mushrooms + 1/4 🧀 Cheese + 1/4 🫑 Peppers', [['Mushrooms', '🍄', 2], ['Cheese', '🧀', 1], ['Peppers', '🌶️', 1]]],
  ['Customer wants: 1/2 🍍 Pineapple + 1/4 🔴 Pepperoni + 1/4 🫒 Olives', [['Pineapple', '🍍', 2], ['Pepperoni', '🔴', 1], ['Olives', '🫒', 1]]],
  ['Customer wants: 1/4 🫑 Peppers + 1/4 🔴 Pepperoni + 1/2 🧀 Cheese', [['Peppers', '🌶️', 1], ['Pepperoni', '🔴', 1], ['Cheese', '🧀', 2]]],
  ['Customer wants: 1/4 🍄 Mushrooms + 1/2 🫒 Olives + 1/4 🌽 Corn', [['Mushrooms', '🍄', 1], ['Olives', '🫒', 2], ['Corn', '🌽', 1]]],
  ['Customer wants: 3/4 🔴 Pepperoni + 1/4 🍍 Pineapple', [['Pepperoni', '🔴', 3], ['Pineapple', '🍍', 1]]],
  ['Customer wants: 1/4 🧀 Cheese + 3/4 🍄 Mushrooms', [['Cheese', '🧀', 1], ['Mushrooms', '🍄', 3]]],
  ['Customer wants: 1/2 🫑 Peppers + 1/4 🫒 Olives + 1/4 🍍 Pineapple', [['Peppers', '🌶️', 2], ['Olives', '🫒', 1], ['Pineapple', '🍍', 1]]],
  ['Customer wants: 2/4 🔴 Pepperoni + 1/4 🫑 Peppers + 1/4 🫒 Olives', [['Pepperoni', '🔴', 2], ['Peppers', '🌶️', 1], ['Olives', '🫒', 1]]],
  ['Customer wants: 2/4 🍄 Mushrooms + 2/4 🧀 Cheese', [['Mushrooms', '🍄', 2], ['Cheese', '🧀', 2]]],
  ['Customer wants: 3/4 🌽 Corn + 1/4 🍍 Pineapple', [['Corn', '🌽', 3], ['Pineapple', '🍍', 1]]],
  ['Customer wants: 2/4 🫑 Peppers + 1/4 🔴 Pepperoni + 1/4 🍄 Mushrooms', [['Peppers', '🌶️', 2], ['Pepperoni', '🔴', 1], ['Mushrooms', '🍄', 1]]],
  ['Customer wants: 1/4 🫒 Olives + 1/4 🌽 Corn + 2/4 🔴 Pepperoni', [['Olives', '🫒', 1], ['Corn', '🌽', 1], ['Pepperoni', '🔴', 2]]],
  ['Customer wants: 1/2 🔴 Pepperoni + 1/4 🫑 Peppers + 1/4 🍄 Mushrooms', [['Pepperoni', '🔴', 2], ['Peppers', '🌶️', 1], ['Mushrooms', '🍄', 1]]],
  ['Customer wants: 1/4 🍍 Pineapple + 1/4 🫒 Olives + 1/2 🧀 Cheese', [['Pineapple', '🍍', 1], ['Olives', '🫒', 1], ['Cheese', '🧀', 2]]],
  ['Customer wants: 3/4 🫑 Peppers + 1/4 🌽 Corn', [['Peppers', '🌶️', 3], ['Corn', '🌽', 1]]],
  ['Customer wants: 1/4 🔴 Pepperoni + 1/4 🧀 Cheese + 1/4 🍄 Mushrooms + 1/4 🫒 Olives', [['Pepperoni', '🔴', 1], ['Cheese', '🧀', 1], ['Mushrooms', '🍄', 1], ['Olives', '🫒', 1]]],
  ['Customer wants: 1/2 🍄 Mushrooms + 1/4 🫑 Peppers + 1/4 🍍 Pineapple', [['Mushrooms', '🍄', 2], ['Peppers', '🌶️', 1], ['Pineapple', '🍍', 1]]],
  ['🔥 BONUS! Customer wants: 1/4 🔴 Pepperoni + 1/4 🫑 Peppers + 1/2 🍄 Mushrooms', [['Pepperoni', '🔴', 1], ['Peppers', '🌶️', 1], ['Mushrooms', '🍄', 2]]],
  ['🔥 BONUS! Customer wants: 3/4 🧀 Cheese + 1/4 🍍 Pineapple', [['Cheese', '🧀', 3], ['Pineapple', '🍍', 1]]],
  ['🔥 BONUS! Customer wants: 1/2 🫒 Olives + 1/4 🌽 Corn + 1/4 🔴 Pepperoni', [['Olives', '🫒', 2], ['Corn', '🌽', 1], ['Pepperoni', '🔴', 1]]],
  ['🔥 BONUS! Customer wants: 1/4 🫑 Peppers + 1/4 🍄 Mushrooms + 1/4 🫒 Olives + 1/4 🍍 Pineapple', [['Peppers', '🌶️', 1], ['Mushrooms', '🍄', 1], ['Olives', '🫒', 1], ['Pineapple', '🍍', 1]]],
  ['🔥 BONUS! Customer wants: 1/2 🔴 Pepperoni + 1/4 🍍 Pineapple + 1/4 🧀 Cheese', [['Pepperoni', '🔴', 2], ['Pineapple', '🍍', 1], ['Cheese', '🧀', 1]]],
].map(([question, rawOrders]) => ({ question, slices: 4, orders: rawOrders.map(([name, emoji, n]) => ({ topping: { name, emoji, color: TOPPING_COLORS[name] }, n, d: 4 })) }));

function generateOrders() {
  return QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
}

export default function PizzaFractions({ onComplete }) {
  const [initialOrder] = useState(generateOrders);
  const [slices, setSlices] = useState(initialOrder.slices);
  const [orders, setOrders] = useState(initialOrder.orders);
  const [assignments, setAssignments] = useState(() => Array(initialOrder.slices).fill(null));
  const [activeIdx, setActiveIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ text: '', ok: false });
  const [showNext, setShowNext] = useState(false);

  const nextOrder = useCallback(() => {
    const fresh = generateOrders();
    setSlices(fresh.slices);
    setOrders(fresh.orders);
    setAssignments(Array(fresh.slices).fill(null));
    setActiveIdx(0);
    setFeedback({ text: '', ok: false });
    setShowNext(false);
  }, []);

  const toggleSlice = (index) => {
    setAssignments((current) => {
      const next = [...current];
      const currentValue = next[index];
      if (currentValue === activeIdx) {
        next[index] = null;
      } else {
        next[index] = activeIdx;
      }
      return next;
    });
  };

  const checkAnswer = () => {
    let isCorrect = true;
    orders.forEach((order, index) => {
      const got = assignments.filter((value) => value === index).length;
      const expected = Math.round((order.n / order.d) * slices);
      if (got !== expected) isCorrect = false;
    });

    if (isCorrect) {
      const nextScore = score + 15;
      setScore(nextScore);
      setFeedback({ text: '🎉 Perfect pizza! The customer is happy!', ok: true });
      setShowNext(true);
      onComplete?.(nextScore, 100);
      return;
    }

    setFeedback({ text: '🤔 Not quite right! Check the fractions!', ok: false });
  };

  return (
    <main className="pizza-fractions-game">
      <style>{STYLES}</style>
      <div className="pizza-fractions-shell">
        <div className="pizza-fractions-order-box">
          <div className="pizza-fractions-order-text">Customer wants: {orders.map((order) => `${order.n}/${order.d} ${order.topping.emoji} ${order.topping.name}`).join(' + ')}</div>
          <div className="pizza-fractions-order-sub">Click the correct slices, then press Check!</div>
        </div>

        <div className="pizza-fractions-main">
          <div className="pizza-fractions-pizza-container">
            <svg className="pizza-fractions-pizza" viewBox="0 0 240 240" width="240" height="240">
              <circle cx="120" cy="120" r="110" fill="#c8860a" />
              <circle cx="120" cy="120" r="102" fill="#f0c040" />
              <circle cx="120" cy="120" r="84" fill="#c0392b" />
              {Array.from({ length: slices }, (_, index) => {
                const start = (index / slices) * Math.PI * 2 - Math.PI / 2;
                const end = ((index + 1) / slices) * Math.PI * 2 - Math.PI / 2;
                const cx = 120;
                const cy = 120;
                const r = 110;
                const x1 = cx + r * Math.cos(start);
                const y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end);
                const y2 = cy + r * Math.sin(end);
                const fill = assignments[index] === null ? 'transparent' : orders[assignments[index]].topping.color + 'bb';

                return (
                  <g key={`slice-${index}`}>
                    <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={fill} stroke="#8b6914" strokeWidth="2" onClick={() => toggleSlice(index)} style={{ cursor: 'pointer' }} />
                    <text x={cx + (r * 0.58) * Math.cos((start + end) / 2)} y={cy + (r * 0.58) * Math.sin((start + end) / 2)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="14" fontFamily="Fredoka One, cursive">
                      {index + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="pizza-fractions-info-panel">Selected: <strong>{orders.length ? orders.map((_, index) => assignments.filter((value) => value === index).length).join(' + ') : 0}</strong> / {slices} slices</div>
          </div>

          <div className="pizza-fractions-toppings-panel">
            <div className="pizza-fractions-label">🎨 Choose topping:</div>
            {orders.map((order, index) => (
              <button key={`${order.topping.name}-${index}`} type="button" className={`pizza-fractions-button ${index === activeIdx ? 'active' : ''}`} style={{ background: `${order.topping.color}cc` }} onClick={() => setActiveIdx(index)}>
                {order.topping.emoji} {order.topping.name}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="pizza-fractions-check" onClick={checkAnswer}>Check Pizza ✅</button>
        <div className={`pizza-fractions-feedback ${feedback.ok ? 'pizza-fractions-ok' : ''}`}>{feedback.text}</div>
        <div className="pizza-fractions-score-row">⭐ Score: <span>{score}</span></div>
        {showNext && <button type="button" className="pizza-fractions-next" onClick={nextOrder}>Next Order! 🍕</button>}
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
  width: min(100%, 1120px);
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
  width: min(100%, 900px);
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
  width: min(100%, 900px);
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
  align-self: center;
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
@media (min-width: 900px) {
  .pizza-fractions-shell { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.72fr); column-gap: 32px; align-items: center; text-align: left; }
  .pizza-fractions-order-box { grid-column: 1 / -1; justify-self: center; text-align: center; }
  .pizza-fractions-main { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(260px, 0.72fr); align-items: center; justify-self: center; }
  .pizza-fractions-pizza-container { justify-self: center; }
  .pizza-fractions-check, .pizza-fractions-feedback, .pizza-fractions-score-row, .pizza-fractions-next { grid-column: 1 / -1; justify-self: center; }
}
@media (max-width: 899px) { .pizza-fractions-shell { max-width: 760px; } }
`;
