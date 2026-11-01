'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './bananaDash.css';
import {
  BANANA_GOAL_DEFAULT,
  BANANA_GOAL_MAX,
  BANANA_GOAL_MIN,
  BANANA_TEAMS,
  DEFAULT_QUESTION_TEXT,
  GOLDEN_LETTERS,
  calculateBananaAccuracy,
  createBananaTeams,
  getBananaQuestion,
  getSpinnerRotation,
  parseBananaQuestions,
} from './bananaDash';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function wheelGradient(teams) {
  if (!teams.length) return 'conic-gradient(#e4b83f 0deg 360deg)';
  const slice = 360 / teams.length;
  return `conic-gradient(${teams.map((team, index) => `${team.color} ${index * slice}deg ${(index + 1) * slice}deg`).join(',')})`;
}

function BananaDash({ onComplete, profileName = '' }) {
  const [screen, setScreen] = useState('welcome');
  const [teamCount, setTeamCount] = useState(4);
  const [teamNames, setTeamNames] = useState([
    profileName ? `${profileName}'s Team` : BANANA_TEAMS[0].name,
    BANANA_TEAMS[1].name,
    BANANA_TEAMS[2].name,
    BANANA_TEAMS[3].name,
  ]);
  const [goal, setGoal] = useState(BANANA_GOAL_DEFAULT);
  const [questionText, setQuestionText] = useState(DEFAULT_QUESTION_TEXT.join('\n'));
  const [teams, setTeams] = useState([]);
  const [phase, setPhase] = useState('spin');
  const [eligibleTeams, setEligibleTeams] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [usedLetters, setUsedLetters] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [result, setResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [goldenLetters, setGoldenLetters] = useState(GOLDEN_LETTERS);
  const spinTimer = useRef(null);
  const completionSent = useRef(false);

  const questions = useMemo(() => parseBananaQuestions(questionText), [questionText]);
  const activeTeam = activeTeamIndex === null ? null : teams[activeTeamIndex];
  const accuracy = calculateBananaAccuracy(correctCount, answeredCount);

  useEffect(() => () => {
    if (spinTimer.current) clearTimeout(spinTimer.current);
  }, []);

  const startGame = () => {
    const nextTeams = createBananaTeams(teamNames, teamCount);
    const shuffledGolden = [...ALPHABET].sort(() => Math.random() - 0.5).slice(0, 4);
    setTeams(nextTeams);
    setEligibleTeams(nextTeams.map((_, index) => index));
    setPhase('spin');
    setActiveTeamIndex(null);
    setWheelRotation(0);
    setIsSpinning(false);
    setSelectedLetter(null);
    setQuestion(null);
    setAnswerVisible(false);
    setUsedLetters([]);
    setQuestionNumber(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setResult(null);
    setWinner(null);
    setGoldenLetters(shuffledGolden);
    completionSent.current = false;
    setScreen('game');
  };

  const spinForTeam = () => {
    if (isSpinning || !teams.length) return;
    const pool = eligibleTeams.length ? eligibleTeams : teams.map((_, index) => index);
    const pickedIndex = pool[Math.floor(Math.random() * pool.length)];
    const remaining = pool.filter((index) => index !== pickedIndex);
    setEligibleTeams(remaining);
    const desired = getSpinnerRotation(pickedIndex, teams.length) % 360;
    setWheelRotation((previous) => previous + 360 * 4 + ((desired - (previous % 360) + 360) % 360));
    setIsSpinning(true);
    spinTimer.current = setTimeout(() => {
      setActiveTeamIndex(pickedIndex);
      setPhase('choose');
      setIsSpinning(false);
      spinTimer.current = null;
    }, 1900);
  };

  const pickBanana = (letter) => {
    if (!activeTeam || usedLetters.includes(letter)) return;
    const chosenQuestion = getBananaQuestion(questions, letter, questionNumber);
    setSelectedLetter(letter);
    setQuestion(chosenQuestion);
    setAnswerVisible(false);
    setQuestionNumber((number) => number + 1);
    setScreen('question');
  };

  const finishQuestion = (wasCorrect) => {
    if (!activeTeam || !selectedLetter) return;
    const nextAnswered = answeredCount + 1;
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
    setAnsweredCount(nextAnswered);
    setCorrectCount(nextCorrect);
    setUsedLetters((letters) => [...letters, selectedLetter]);

    if (wasCorrect) {
      const goldenBonus = goldenLetters.includes(selectedLetter) ? 1 : 0;
      const nextStreak = activeTeam.streak + 1;
      const streakBonus = nextStreak % 3 === 0 ? 1 : 0;
      const gained = 1 + goldenBonus + streakBonus;
      const nextTeams = teams.map((team, index) => index === activeTeamIndex
        ? { ...team, bananas: team.bananas + gained, streak: nextStreak }
        : team);
      setTeams(nextTeams);
      const winningTeam = nextTeams[activeTeamIndex];
      if (winningTeam.bananas >= goal) {
        setWinner(winningTeam);
        setScreen('winner');
        if (!completionSent.current) {
          completionSent.current = true;
          onComplete?.(winningTeam.bananas, calculateBananaAccuracy(nextCorrect, nextAnswered));
        }
      } else {
        setResult({ correct: true, gained, goldenBonus: Boolean(goldenBonus), streakBonus: Boolean(streakBonus), team: winningTeam });
        setScreen('result');
      }
      return;
    }

    const nextTeams = teams.map((team, index) => index === activeTeamIndex ? { ...team, streak: 0 } : team);
    setTeams(nextTeams);
    setResult({ correct: false, gained: 0, team: nextTeams[activeTeamIndex] });
    setScreen('result');
  };

  const continueGame = () => {
    if (usedLetters.length + 1 >= ALPHABET.length) setUsedLetters([]);
    setSelectedLetter(null);
    setQuestion(null);
    setAnswerVisible(false);
    setResult(null);
    setActiveTeamIndex(null);
    setPhase('spin');
    setScreen('game');
  };

  const backToSetup = () => {
    if (spinTimer.current) clearTimeout(spinTimer.current);
    setIsSpinning(false);
    setScreen('setup');
  };

  const renderTrack = (team) => (
    <div className="banana-lane" key={team.id} style={{ '--team-color': team.color, '--banana-goal': goal }}>
      <div className="banana-lane-team">
        <span className="banana-lane-animal" aria-hidden="true">{team.animal}</span>
        <span className="banana-lane-name">{team.name}</span>
        <strong>{team.bananas}<small>/{goal}</small></strong>
      </div>
      <div className="banana-lane-track" aria-label={`${team.name}: ${team.bananas} of ${goal} bananas`}>
        {Array.from({ length: goal }, (_, index) => <span className={`banana-step ${index < team.bananas ? 'earned' : ''}`} key={index}>{index < team.bananas ? '🍌' : ''}</span>)}
        <span className="banana-runner" style={{ left: `${Math.min(97, Math.max(3, (team.bananas / goal) * 100))}%` }} aria-label={`${team.name} runner`}>{team.animal}</span>
        <span className="banana-finish" aria-hidden="true">🏁</span>
      </div>
    </div>
  );

  if (screen === 'welcome') return (
    <main className="banana-dash">
      <div className="banana-welcome panel">
        <div className="banana-brand-row"><span className="banana-brand-mark">🍌</span><span className="banana-eyebrow">A team question race</span></div>
        <div className="banana-welcome-art" aria-hidden="true"><span>🐼</span><span>🐨</span><span>🦝</span><span>🐵</span></div>
        <p className="banana-kicker">JUNGLE TEAM CHALLENGE</p>
        <h1>Banana <em>Dash</em></h1>
        <p className="banana-lede">Spin for a team, pick a letter banana, and race up the palms to the golden grove.</p>
        <div className="banana-rule-row"><span>🎡 Spin</span><b>→</b><span>🔤 Pick</span><b>→</b><span>🍌 Earn</span></div>
        <button className="banana-button banana-button-primary" onClick={() => setScreen('setup')}>Set up teams <span>→</span></button>
        <p className="banana-small-note">Teacher-led questions · 2–4 teams · No timer</p>
      </div>
    </main>
  );

  if (screen === 'setup') return (
    <main className="banana-dash">
      <section className="banana-setup panel">
        <header className="banana-screen-heading"><div><p className="banana-kicker">BEFORE THE RACE</p><h1>Build your jungle teams</h1><p>Choose your racers and add the questions you want the class to practise.</p></div><button className="banana-icon-button" onClick={() => setScreen('welcome')} aria-label="Back to title">✕</button></header>
        <div className="banana-setup-grid">
          <section className="banana-setup-card">
            <div className="banana-field-row"><label htmlFor="banana-team-count">Teams</label><select id="banana-team-count" value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}><option value="2">2 teams</option><option value="3">3 teams</option><option value="4">4 teams</option></select></div>
            <div className="banana-field-row"><label htmlFor="banana-goal">Bananas to win</label><select id="banana-goal" value={goal} onChange={(event) => setGoal(Number(event.target.value))}>{Array.from({ length: BANANA_GOAL_MAX - BANANA_GOAL_MIN + 1 }, (_, index) => BANANA_GOAL_MIN + index).map((value) => <option key={value} value={value}>{value} bananas</option>)}</select></div>
            <div className="banana-team-editor">{BANANA_TEAMS.slice(0, teamCount).map((team, index) => <label className="banana-name-field" key={team.id}><span style={{ '--team-color': team.color }}>{team.animal}</span><input value={teamNames[index]} maxLength={22} onChange={(event) => setTeamNames((old) => old.map((name, nameIndex) => nameIndex === index ? event.target.value : name))} aria-label={`${team.name} name`} /></label>)}</div>
            <p className="banana-helper">Each team spins once before anyone gets a second turn. Names are just for this game.</p>
          </section>
          <section className="banana-setup-card banana-question-editor"><div className="banana-editor-heading"><div><h2>Question bank</h2><p>One question per line. Add an optional letter to attach a question to a banana.</p></div><span>{questions.length} ready</span></div><div className="banana-format-example"><code>letter | question | answer</code><small>or <code>question | answer</code></small></div><textarea value={questionText} onChange={(event) => setQuestionText(event.target.value)} rows={12} aria-label="Question and answer list" spellCheck="false" /><p className="banana-helper">The teacher reads the question, reveals the answer, and marks it correct. You can edit this list before every class.</p></section>
        </div>
        <footer className="banana-setup-footer"><span>Golden letters award an extra banana. A 3-answer streak earns a bonus banana.</span><button className="banana-button banana-button-primary" onClick={startGame}>Start the dash <span>→</span></button></footer>
      </section>
    </main>
  );

  if (screen === 'question') return (
    <main className="banana-dash banana-question-screen">
      <section className="banana-question-panel panel">
        <button className="banana-text-button" onClick={() => setScreen('game')}>← Back to palms</button>
        <div className="banana-question-meta"><span className="banana-active-chip" style={{ '--team-color': activeTeam?.color }}>{activeTeam?.animal} {activeTeam?.name}</span><span className={`banana-letter-chip ${goldenLetters.includes(selectedLetter) ? 'is-golden' : ''}`}>{selectedLetter}{goldenLetters.includes(selectedLetter) && ' ✨'}</span></div>
        <p className="banana-kicker">READ IT OUT LOUD</p>
        <h1>{question?.prompt}</h1>
        {answerVisible ? <div className="banana-answer"><span>ANSWER</span><strong>{question?.answer}</strong></div> : <div className="banana-answer-hidden"><span>Teacher: reveal the answer when the team is ready.</span><button className="banana-button banana-button-secondary" onClick={() => setAnswerVisible(true)}>Reveal answer</button></div>}
        {answerVisible && <div className="banana-mark-actions"><p>Did {activeTeam?.name} get it right?</p><button className="banana-button banana-button-correct" onClick={() => finishQuestion(true)}>Correct <span>+ bananas</span></button><button className="banana-button banana-button-wrong" onClick={() => finishQuestion(false)}>Not this time</button></div>}
        <p className="banana-question-footnote">A correct answer collects the banana. The golden letters are worth two.</p>
      </section>
    </main>
  );

  if (screen === 'result') return (
    <main className="banana-dash">
      <section className={`banana-result-panel panel ${result?.correct ? 'is-correct' : 'is-missed'}`}>
        <div className="banana-result-art" aria-hidden="true">{result?.correct ? (result.goldenBonus ? '✨🍌✨' : '🍌') : '🌿'}</div>
        <p className="banana-kicker">{result?.correct ? 'BANANA COLLECTED' : 'KEEP CLIMBING'}</p>
        <h1>{result?.correct ? `Nice work, ${result.team.name}!` : `${result?.team.name}, try the next one!`}</h1>
        <p>{result?.correct ? `+${result.gained} banana${result.gained === 1 ? '' : 's'} for your team.` : 'No banana this turn. The next team gets the spinner.'}</p>
        {result?.goldenBonus && <span className="banana-bonus-pill">Golden banana bonus +1</span>}
        {result?.streakBonus && <span className="banana-bonus-pill">Three-answer streak bonus +1</span>}
        <button className="banana-button banana-button-primary" onClick={continueGame}>Back to the jungle <span>→</span></button>
      </section>
    </main>
  );

  if (screen === 'winner') return (
    <main className="banana-dash">
      <section className="banana-winner panel">
        <p className="banana-kicker">THE JUNGLE CHAMPION</p>
        <div className="banana-winner-animal" style={{ '--team-color': winner?.color }}>{winner?.animal}</div>
        <h1>{winner?.name} reached the golden grove!</h1>
        <p>{winner?.bananas} bananas · {answeredCount} questions · {accuracy}% correct</p>
        <div className="banana-winner-scoreboard">{teams.map((team) => <div key={team.id} style={{ '--team-color': team.color }}><span>{team.animal} {team.name}</span><strong>{team.bananas} 🍌</strong></div>)}</div>
        <div className="banana-winner-actions"><button className="banana-button banana-button-primary" onClick={startGame}>Play again <span>↻</span></button><button className="banana-button banana-button-secondary" onClick={backToSetup}>Edit teams</button></div>
      </section>
    </main>
  );

  const wheelPositions = teams.map((team, index) => {
    const angle = ((index + 0.5) * (360 / teams.length) - 90) * (Math.PI / 180);
    return { team, left: `${50 + Math.cos(angle) * 31}%`, top: `${50 + Math.sin(angle) * 31}%` };
  });

  return (
    <main className="banana-dash banana-game-screen">
      <header className="banana-game-header panel">
        <div className="banana-game-title"><span>🍌</span><div><p className="banana-kicker">JUNGLE TEAM CHALLENGE</p><h1>Banana Dash</h1></div></div>
        <div className="banana-game-header-right"><span className="banana-goal-pill">🏆 First to {goal}</span><button className="banana-text-button" onClick={backToSetup}>Edit game</button></div>
      </header>

      <section className="banana-scoreboard panel" aria-label="Team progress">
        <div className="banana-section-heading"><div><p className="banana-kicker">THE RACE TO THE GOLDEN GROVE</p><h2>Climb the palms</h2></div><span>{teams.reduce((sum, team) => sum + team.bananas, 0)} 🍌 collected</span></div>
        <div className="banana-lanes">{teams.map(renderTrack)}</div>
      </section>

      <div className="banana-play-grid">
        <section className="banana-spinner-panel panel">
          <div className="banana-section-heading"><div><p className="banana-kicker">STEP 1</p><h2>{phase === 'spin' ? 'Who is up next?' : 'Your team is up!'}</h2></div><span className="banana-turns-left">{eligibleTeams.length || teams.length} teams waiting</span></div>
          <div className="banana-wheel-area">
            <div className="banana-wheel-pointer" aria-hidden="true">▼</div>
            <div className={`banana-wheel ${isSpinning ? 'is-spinning' : ''}`} style={{ background: wheelGradient(teams), transform: `rotate(${wheelRotation}deg)` }} aria-label="Team selection wheel">
              {wheelPositions.map(({ team, left, top }) => <span className="banana-wheel-animal" key={team.id} style={{ left, top }}>{team.animal}</span>)}
              <span className="banana-wheel-center" aria-hidden="true">🍌</span>
            </div>
          </div>
          {phase === 'spin' ? <><button className="banana-button banana-button-primary banana-spin-button" onClick={spinForTeam} disabled={isSpinning}>{isSpinning ? 'Spinning…' : 'Spin for a team'} <span>🎡</span></button><p className="banana-helper banana-center">The spinner won’t pick a team twice until every team has had a go.</p></> : <div className="banana-active-team-callout" style={{ '--team-color': activeTeam?.color }}><div><span>{activeTeam?.animal}</span><div><strong>{activeTeam?.name}</strong><small>Pick a letter banana to get your question.</small></div></div><span className="banana-step-badge">STEP 2</span></div>}
        </section>

        <section className="banana-letter-panel panel">
          <div className="banana-section-heading"><div><p className="banana-kicker">STEP 2</p><h2>Choose a banana</h2></div><span className="banana-legend"><i /> Golden banana</span></div>
          <p className="banana-helper">Pick a letter. The teacher reads the matching question—or the next question in the bank.</p>
          <div className="banana-letter-grid" aria-label="Letter bananas">
            {ALPHABET.map((letter, index) => {
              const isUsed = usedLetters.includes(letter);
              const isGolden = goldenLetters.includes(letter);
              return <button type="button" key={letter} className={`banana-letter ${isGolden ? 'is-golden' : ''} ${isUsed ? 'is-used' : ''}`} disabled={!activeTeam || phase !== 'choose' || isUsed} onClick={() => pickBanana(letter)} aria-label={`${letter}${isGolden ? ', golden banana, worth a bonus' : ''}${isUsed ? ', already picked' : ''}`}><span className="banana-letter-fruit">🍌</span><b>{letter}</b>{isGolden && <i>★</i>}</button>;
            })}
          </div>
          {phase === 'spin' && <div className="banana-board-hint">Spin the team wheel first to unlock the bananas.</div>}
          <div className="banana-own-twist"><span>✨</span><p><strong>Streak bonus</strong> Get three answers right in a row to earn an extra banana.</p></div>
        </section>
      </div>
      <footer className="banana-game-footer"><span>Teacher reads each prompt and marks the team’s answer.</span><button className="banana-text-button" onClick={backToSetup}>Question setup</button></footer>
    </main>
  );
}

export default BananaDash;
