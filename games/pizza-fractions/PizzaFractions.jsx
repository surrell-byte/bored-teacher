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
            <div className="pizza-fractions-wooden-board">
              <span className="pizza-fractions-flour pizza-fractions-flour-one" aria-hidden="true" />
              <span className="pizza-fractions-flour pizza-fractions-flour-two" aria-hidden="true" />
              <span className="pizza-fractions-flour pizza-fractions-flour-three" aria-hidden="true" />
              <div className="pizza-fractions-pizza" role="group" aria-label="Pizza slices">
                {Array.from({ length: slices }, (_, index) => {
                  const assigned = assignments[index];
                  const topping = assigned === null ? null : orders[assigned]?.topping;
                  return (
                    <button
                      key={`slice-${index}`}
                      type="button"
                      className={`pizza-fractions-slice pizza-fractions-slice-${index + 1}${assigned !== null ? ' selected' : ''}`}
                      onClick={() => toggleSlice(index)}
                      aria-label={`Pizza slice ${index + 1}${topping ? `, ${topping.name}` : ', unassigned'}`}
                    >
                      {topping && <span className="pizza-fractions-topping" aria-hidden="true">{topping.emoji}</span>}
                      <span className="pizza-fractions-slice-number" aria-hidden="true">{index + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pizza-fractions-toppings-panel">
            <div className="pizza-fractions-label">🎨 Choose topping:</div>
            {orders.map((order, index) => (
              <button key={`${order.topping.name}-${index}`} type="button" className={`pizza-fractions-button ${index === activeIdx ? 'active' : ''}`} style={{ background: `${order.topping.color}cc` }} onClick={() => setActiveIdx(index)}>
                {order.topping.emoji} {order.topping.name}
              </button>
            ))}
            <div className="pizza-fractions-info-panel">Selected: <strong>{orders.length ? orders.map((_, index) => assignments.filter((value) => value === index).length).join(' + ') : 0}</strong> / {slices} slices</div>
            <button type="button" className="pizza-fractions-check" onClick={checkAnswer}>Check Pizza ✅</button>
            <div className={`pizza-fractions-feedback ${feedback.ok ? 'pizza-fractions-ok' : ''}`}>{feedback.text}</div>
            {showNext && <button type="button" className="pizza-fractions-next" onClick={nextOrder}>Next Order! 🍕</button>}
          </div>
        </div>
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
  width: min(100%, 1240px);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: clamp(16px, 2vw, 28px) clamp(12px, 3vw, 32px);
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
  margin: 0;
  width: min(100%, 900px);
}
.pizza-fractions-order-text {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  color: #ffd700;
  text-wrap: balance;
}
.pizza-fractions-order-sub {
  font-size: 0.95rem;
  color: #ffc;
  margin-top: 4px;
}
.pizza-fractions-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, .56fr);
  gap: clamp(18px, 3vw, 42px);
  align-items: center;
  justify-content: center;
  width: min(100%, 1080px);
}
.pizza-fractions-pizza-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
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
  width: 100%;
  box-sizing: border-box;
}
.pizza-fractions-info-panel strong {
  color: #ffd700;
  font-size: 1.2rem;
}
.pizza-fractions-toppings-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  width: 100%;
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
  min-height: 48px;
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
  margin-top: 0;
  align-self: center;
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
  margin-top: -6px;
  text-align: center;
}
.pizza-fractions-game { background: linear-gradient(rgba(35,14,5,.16),rgba(35,14,5,.16)), url('/games/pizza-fractions/game-bg.png') center / cover fixed; overflow: auto; }
.pizza-fractions-wooden-board { box-sizing: border-box; width: min(100%, 620px); aspect-ratio: 1.18; position: relative; display: grid; place-items: center; padding: 35px; overflow: hidden; border: 7px solid #6d3215; border-radius: 28px; background: linear-gradient(135deg,#a65b25,#d4873c 25%,#8c451c 55%,#c8752d); box-shadow: 0 15px 0 #3c190a,0 25px 45px rgba(0,0,0,.55),inset 0 0 0 3px rgba(255,210,130,.25),inset 0 0 35px rgba(60,20,5,.35); }
.pizza-fractions-wooden-board::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .9; background: repeating-linear-gradient(4deg,transparent 0,transparent 13px,rgba(70,30,10,.11) 14px,transparent 17px); }
.pizza-fractions-pizza { position: relative; z-index: 1; width: min(100%, 450px); aspect-ratio: 1; overflow: hidden; border: 13px solid #e7a53b; border-radius: 50%; background: radial-gradient(circle at 50% 45%,#e84519 0,#c92710 55%,#a7190b 100%); box-shadow: 0 10px 15px rgba(0,0,0,.45),0 3px 0 #7a3d0e,inset 0 0 0 5px #f5c45c,inset 0 0 30px rgba(80,15,0,.35); }
.pizza-fractions-pizza::before { content: ''; position: absolute; inset: 18px; z-index: 0; border-radius: 50%; background: radial-gradient(circle at 30% 30%,#ffd75c 0 3%,transparent 4%),radial-gradient(circle at 70% 25%,#f6c83f 0 4%,transparent 5%),radial-gradient(circle at 50% 70%,#ffdf68 0 3%,transparent 4%),linear-gradient(135deg,#ffd85b,#efaa28); }
.pizza-fractions-slice { position: absolute; z-index: 2; width: 50%; height: 50%; padding: 0; border: 0; cursor: pointer; background: radial-gradient(circle at 50% 50%,#f8cf50,#df9f27); transition: transform .18s ease,filter .18s ease,box-shadow .18s ease; overflow: hidden; }
.pizza-fractions-slice::after { content: ''; position: absolute; inset: 0; border: 2px solid rgba(110,50,10,.65); pointer-events: none; }
.pizza-fractions-slice-1 { top: 0; left: 0; border-right: 3px solid rgba(110,50,10,.65); border-bottom: 3px solid rgba(110,50,10,.65); border-radius: 100% 0 0 0; }
.pizza-fractions-slice-2 { top: 0; right: 0; border-left: 3px solid rgba(110,50,10,.65); border-bottom: 3px solid rgba(110,50,10,.65); border-radius: 0 100% 0 0; }
.pizza-fractions-slice-3 { bottom: 0; left: 0; border-right: 3px solid rgba(110,50,10,.65); border-top: 3px solid rgba(110,50,10,.65); border-radius: 0 0 0 100%; }
.pizza-fractions-slice-4 { bottom: 0; right: 0; border-left: 3px solid rgba(110,50,10,.65); border-top: 3px solid rgba(110,50,10,.65); border-radius: 0 0 100% 0; }
.pizza-fractions-slice:hover { filter: brightness(1.12); transform: scale(1.025); z-index: 4; }
.pizza-fractions-slice.selected { filter: brightness(1.12) saturate(1.2); box-shadow: inset 0 0 0 6px #fff3a1,inset 0 0 25px rgba(255,220,70,.6),0 0 20px rgba(255,215,80,.65); z-index: 3; }
.pizza-fractions-slice.selected::before { content: '✓'; position: absolute; top: 45%; left: 45%; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; background: #3d8b42; border: 3px solid white; color: white; font-size: 20px; font-weight: 900; z-index: 5; }
.pizza-fractions-topping { position: absolute; top: 32%; left: 32%; z-index: 4; font-size: clamp(1.5rem,3vw,2.6rem); filter: drop-shadow(0 3px 3px rgba(0,0,0,.45)); pointer-events: none; }
.pizza-fractions-slice-number { position: absolute; z-index: 4; color: rgba(255,255,255,.72); font-size: 15px; text-shadow: 0 2px 3px rgba(0,0,0,.7); }
.pizza-fractions-slice-1 .pizza-fractions-slice-number,.pizza-fractions-slice-3 .pizza-fractions-slice-number { right: 30%; }
.pizza-fractions-slice-2 .pizza-fractions-slice-number,.pizza-fractions-slice-4 .pizza-fractions-slice-number { left: 30%; }
.pizza-fractions-slice-1 .pizza-fractions-slice-number,.pizza-fractions-slice-2 .pizza-fractions-slice-number { top: 28%; }
.pizza-fractions-slice-3 .pizza-fractions-slice-number,.pizza-fractions-slice-4 .pizza-fractions-slice-number { bottom: 28%; }
.pizza-fractions-flour { position: absolute; z-index: 1; width: 100px; height: 45px; border-radius: 50%; background: radial-gradient(ellipse,rgba(255,248,220,.8),rgba(255,248,220,0)); filter: blur(2px); }
.pizza-fractions-flour-one { top: 35px; left: 40px; transform: rotate(-15deg); }.pizza-fractions-flour-two { right: 40px; bottom: 35px; transform: rotate(20deg); }.pizza-fractions-flour-three { left: 75px; bottom: 80px; width: 60px; height: 25px; }
@media (max-width: 899px) {
  .pizza-fractions-game { background-attachment: scroll; }
  .pizza-fractions-shell { justify-content: flex-start; gap: 12px; padding: 14px 12px 24px; }
  .pizza-fractions-order-box { padding: 10px 12px; border-radius: 16px; }
  .pizza-fractions-order-text { font-size: clamp(1.05rem, 5.2vw, 1.35rem); line-height: 1.25; }
  .pizza-fractions-order-sub { font-size: .88rem; }
  .pizza-fractions-main { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .pizza-fractions-wooden-board { width: min(100%, 520px); aspect-ratio: 1; padding: 18px; border-width: 5px; border-radius: 22px; }
  .pizza-fractions-pizza { width: min(100%, 430px); border-width: 10px; }
  .pizza-fractions-pizza::before { inset: 13px; }
  .pizza-fractions-toppings-panel { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .pizza-fractions-label, .pizza-fractions-info-panel, .pizza-fractions-check, .pizza-fractions-feedback, .pizza-fractions-next { grid-column: 1 / -1; }
  .pizza-fractions-label { margin: 0; }
  .pizza-fractions-button { min-width: 0; min-height: 46px; justify-content: center; padding: 9px 8px; font-size: 1rem; }
  .pizza-fractions-button.active { transform: none; outline-width: 3px; }
  .pizza-fractions-check, .pizza-fractions-next { min-height: 48px; padding-inline: 24px; font-size: 1.15rem; }
  .pizza-fractions-feedback { font-size: 1.1rem; min-height: 1.45rem; }
  .pizza-fractions-flour { transform: scale(.65); }
  .pizza-fractions-flour-one { top: 12px; left: 12px; }.pizza-fractions-flour-two { right: 12px; bottom: 12px; }.pizza-fractions-flour-three { left: 28px; bottom: 34px; }
}
@media (max-width: 360px) {
  .pizza-fractions-toppings-panel { grid-template-columns: 1fr; }
  .pizza-fractions-button { justify-content: flex-start; padding-inline: 14px; }
}
`;
