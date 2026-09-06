'use client';

import { useCallback, useMemo, useState } from 'react';
import { useGame } from '@/lib/gameState';

const CATEGORY_DATA = {
  animals: {
    label: 'Animals',
    icon: '🐾',
    color: '#36b37e',
    rounds: [
      { description: 'I have a long neck, eat leaves from tall trees, and have brown patches.', answers: ['Giraffe'], choices: ['Giraffe', 'Horse', 'Zebra', 'Elephant'] },
      { description: 'I live in the ocean, have eight arms, and can squirt ink when I am frightened.', answers: ['Octopus'], choices: ['Crab', 'Octopus', 'Dolphin', 'Shark'] },
      { description: 'I am small, hop very far, and carry my baby in a pouch.', answers: ['Kangaroo'], choices: ['Kangaroo', 'Rabbit', 'Frog', 'Deer'] },
      { description: 'I can change my colours to hide, and my eyes can look in two directions at once.', answers: ['Chameleon'], choices: ['Parrot', 'Chameleon', 'Snake', 'Turtle'] },
      { description: 'I am covered in black and white stripes, but I am not a tiger.', answers: ['Zebra'], choices: ['Panda', 'Zebra', 'Skunk', 'Penguin'] },
    ],
  },
  people: {
    label: 'People',
    icon: '🧑‍🤝‍🧑',
    color: '#e89b3c',
    rounds: [
      { description: 'I help sick people, listen to their hearts, and work in a hospital.', answers: ['Doctor', 'Nurse'], choices: ['Doctor', 'Chef', 'Nurse', 'Pilot'], multi: true },
      { description: 'I fly an aeroplane and take passengers safely to different places.', answers: ['Pilot'], choices: ['Pilot', 'Mechanic', 'Sailor', 'Photographer'] },
      { description: 'I create pictures and paintings using colours, shapes, and imagination.', answers: ['Artist'], choices: ['Artist', 'Athlete', 'Farmer', 'Dentist'] },
      { description: 'I teach lessons, ask questions, and help students learn new things.', answers: ['Teacher'], choices: ['Teacher', 'Builder', 'Singer', 'Driver'] },
      { description: 'I prepare meals in a kitchen and make food taste delicious.', answers: ['Chef'], choices: ['Chef', 'Doctor', 'Dancer', 'Scientist'] },
    ],
  },
  transport: {
    label: 'Transport',
    icon: '🚦',
    color: '#4f8fe8',
    rounds: [
      { description: 'I have two wheels, pedals, and handlebars. You move me with your legs.', answers: ['Bicycle'], choices: ['Bicycle', 'Bus', 'Train', 'Boat'] },
      { description: 'I travel on tracks, carry many passengers, and can be very long.', answers: ['Train'], choices: ['Train', 'Taxi', 'Rocket', 'Bicycle'] },
      { description: 'I travel through the sky, have wings, and carry people across countries.', answers: ['Aeroplane'], choices: ['Helicopter', 'Aeroplane', 'Submarine', 'Tram'] },
      { description: 'I travel on water and can carry people or goods across a river or sea.', answers: ['Boat', 'Ship'], choices: ['Boat', 'Ship', 'Motorbike', 'Van'], multi: true },
      { description: 'I have four wheels, take you around a town, and usually carry a small number of people.', answers: ['Car'], choices: ['Car', 'Train', 'Canoe', 'Rocket'] },
    ],
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_DATA);

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

export default function DescriptionDetective({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState('categories');
  const [category, setCategory] = useState('animals');
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);

  const currentCategory = CATEGORY_DATA[category];
  const currentRound = rounds[roundIndex];
  const progress = rounds.length ? ((roundIndex + (feedback ? 1 : 0)) / rounds.length) * 100 : 0;

  const startCategory = useCallback((key) => {
    setCategory(key);
    setRounds(shuffle(CATEGORY_DATA[key].rounds));
    setRoundIndex(0);
    setSelected([]);
    setFeedback(null);
    setScore(0);
    setCorrectRounds(0);
    setScreen('game');
  }, []);

  const toggleChoice = (choice) => {
    if (feedback) return;
    if (currentRound.multi) {
      setSelected((current) => current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]);
    } else {
      setSelected([choice]);
    }
  };

  const checkAnswer = () => {
    if (!selected.length || feedback) return;
    const expected = [...currentRound.answers].sort();
    const actual = [...selected].sort();
    const isCorrect = expected.length === actual.length && expected.every((answer, index) => answer === actual[index]);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore((value) => value + (currentRound.multi ? 20 : 10));
      setCorrectRounds((value) => value + 1);
    }
  };

  const finishGame = () => {
    const accuracy = Math.round((correctRounds / rounds.length) * 100);
    completeGame('description-detective', accuracy, rounds.length, score);
    onComplete?.(score, accuracy);
    setScreen('result');
  };

  const nextRound = () => {
    if (roundIndex + 1 >= rounds.length) {
      finishGame();
      return;
    }
    setRoundIndex((value) => value + 1);
    setSelected([]);
    setFeedback(null);
  };

  const replay = () => startCategory(category);

  const title = useMemo(() => currentCategory ? `${currentCategory.icon} ${currentCategory.label}` : 'Description Detective', [currentCategory]);

  const shellStyle = { minHeight: '100vh', padding: 'clamp(20px, 5vw, 56px) 20px', background: 'linear-gradient(145deg, #102a43 0%, #155e75 52%, #0f766e 100%)', color: '#f8fafc', fontFamily: "'Nunito', 'Segoe UI', sans-serif" };
  const panelStyle = { width: 'min(100%, 880px)', margin: '0 auto', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 28, padding: 'clamp(24px, 5vw, 52px)', boxShadow: '0 24px 70px rgba(0,0,0,.22)', backdropFilter: 'blur(10px)' };
  const buttonStyle = { border: 0, borderRadius: 16, padding: '15px 20px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' };

  if (screen === 'categories') return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <div style={{ fontSize: '3.5rem' }}>🕵️</div>
        <p style={{ color: '#99f6e4', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Read the clues</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 7vw, 4.8rem)', lineHeight: 1, margin: '8px 0 14px' }}>Description Detective</h1>
        <p style={{ fontSize: '1.15rem', color: '#dbeafe', maxWidth: 600 }}>Read each description carefully and select the correct answer. Some clues have more than one answer.</p>
        <h2 style={{ marginTop: 38 }}>Choose a case file</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginTop: 18 }}>
          {CATEGORY_KEYS.map((key) => {
            const item = CATEGORY_DATA[key];
            return <button key={key} type="button" onClick={() => startCategory(key)} style={{ ...buttonStyle, minHeight: 140, textAlign: 'left', background: item.color, color: '#fff' }}><span style={{ display: 'block', fontSize: '2.5rem' }}>{item.icon}</span><span style={{ display: 'block', marginTop: 10, fontSize: '1.2rem' }}>{item.label}</span><small>{item.rounds.length} clues</small></button>;
          })}
        </div>
      </section>
    </main>
  );

  if (screen === 'result') return (
    <main style={shellStyle}>
      <section style={{ ...panelStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>{correctRounds === rounds.length ? '🏆' : '🔎'}</div>
        <p style={{ color: '#99f6e4', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>{title}</p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>Case file complete</h1>
        <p style={{ fontSize: '1.2rem' }}>You solved <strong>{correctRounds}</strong> of <strong>{rounds.length}</strong> clues.</p>
        <p style={{ fontSize: '2rem', color: '#fde68a', fontWeight: 900 }}>{score} points</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}><button type="button" onClick={replay} style={{ ...buttonStyle, background: '#fbbf24', color: '#422006' }}>🔁 Play again</button><button type="button" onClick={() => setScreen('categories')} style={{ ...buttonStyle, background: 'rgba(255,255,255,.16)', color: '#fff' }}>Choose category</button></div>
      </section>
    </main>
  );

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><p style={{ margin: 0, color: '#99f6e4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em' }}>{title}</p><h1 style={{ margin: '8px 0 0', fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}>What am I?</h1></div>
          <div style={{ textAlign: 'right' }}><strong style={{ color: '#fde68a', fontSize: '1.4rem' }}>{score} pts</strong><div style={{ color: '#dbeafe' }}>Clue {roundIndex + 1} of {rounds.length}</div></div>
        </header>
        <div style={{ height: 8, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden', margin: '24px 0 28px' }}><div style={{ height: '100%', width: `${progress}%`, background: currentCategory.color, transition: 'width .25s' }} /></div>
        <article style={{ background: '#f8fafc', color: '#172033', borderRadius: 22, padding: 'clamp(24px, 5vw, 42px)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem' }}>📋</div>
          <p style={{ fontSize: 'clamp(1.35rem, 3vw, 2rem)', lineHeight: 1.45, fontWeight: 800, margin: '18px auto 0', maxWidth: 720 }}>{currentRound.description}</p>
        </article>
        <p style={{ color: '#dbeafe', fontWeight: 800, margin: '28px 0 12px' }}>{currentRound.multi ? 'Select all correct answers.' : 'Select the correct answer.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {currentRound.choices.map((choice) => { const chosen = selected.includes(choice); return <button key={choice} type="button" onClick={() => toggleChoice(choice)} style={{ ...buttonStyle, background: chosen ? currentCategory.color : 'rgba(255,255,255,.14)', color: '#fff', outline: chosen ? '4px solid rgba(255,255,255,.35)' : 'none', opacity: feedback && !currentRound.answers.includes(choice) ? .7 : 1 }}>{chosen ? '✓ ' : ''}{choice}</button>; })}
        </div>
        {feedback && <div role="status" style={{ marginTop: 20, padding: 16, borderRadius: 14, background: feedback === 'correct' ? 'rgba(52,211,153,.2)' : 'rgba(248,113,113,.2)', color: feedback === 'correct' ? '#bbf7d0' : '#fecaca', fontWeight: 800 }}>{feedback === 'correct' ? `Correct! +${currentRound.multi ? 20 : 10} points.` : `Not quite. The answer${currentRound.answers.length > 1 ? 's are' : ' is'} ${currentRound.answers.join(' and ')}.`}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}><button type="button" onClick={() => setScreen('categories')} style={{ ...buttonStyle, background: 'transparent', color: '#dbeafe', paddingLeft: 0 }}>← Categories</button>{feedback ? <button type="button" onClick={nextRound} style={{ ...buttonStyle, background: '#fbbf24', color: '#422006' }}>{roundIndex + 1 >= rounds.length ? 'See results' : 'Next clue →'}</button> : <button type="button" onClick={checkAnswer} disabled={!selected.length} style={{ ...buttonStyle, background: selected.length ? '#fbbf24' : 'rgba(255,255,255,.2)', color: selected.length ? '#422006' : '#94a3b8', cursor: selected.length ? 'pointer' : 'not-allowed' }}>Check answer</button>}</div>
      </section>
    </main>
  );
}
