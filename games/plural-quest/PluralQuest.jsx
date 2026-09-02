"use client";

import { useEffect, useMemo, useState } from "react";

const QUESTIONS = {
  A1: [
    {
      word: "cat",
      question: "One cat → two ___",
      answers: ["cats", "cates", "caties", "cat"],
      correct: "cats",
      rule: "Most English nouns form their plural by adding -s.",
      tip: "For many everyday nouns, simply add -s.",
    },
    {
      word: "book",
      question: "One book → three ___",
      answers: ["books", "bookes", "bookies", "book"],
      correct: "books",
      rule: "Most English nouns form their plural by adding -s.",
      tip: "book + s = books.",
    },
    {
      word: "bus",
      question: "One bus → two ___",
      answers: ["buses", "buss", "buseses", "bus"],
      correct: "buses",
      rule: "Words ending in -s, -sh, -ch, -x and -z usually take -es.",
      tip: "bus + es = buses.",
    },
    {
      word: "box",
      question: "One box → four ___",
      answers: ["boxes", "boxs", "boxies", "box"],
      correct: "boxes",
      rule: "Words ending in -x usually take -es.",
      tip: "box + es = boxes.",
    },
    {
      word: "baby",
      question: "One baby → two ___",
      answers: ["babys", "babies", "babyes", "baby"],
      correct: "babies",
      rule: "A consonant + y usually changes y to i and adds -es.",
      tip: "baby → babies.",
    },
    {
      word: "city",
      question: "One city → three ___",
      answers: ["citys", "cities", "cityes", "city"],
      correct: "cities",
      rule: "A consonant + y usually changes y to i and adds -es.",
      tip: "city → cities.",
    },
  ],

  A2: [
    {
      word: "hoof",
      question: "One hoof → two ___",
      answers: ["hoofs", "hooves", "hoofes", "hoovs"],
      correct: "hooves",
      rule: "Hoof commonly becomes hooves.",
      tip: "Not every noun ending in -f follows exactly the same pattern.",
    },
    {
      word: "leaf",
      question: "One leaf → many ___",
      answers: ["leafs", "leaves", "leafes", "leavs"],
      correct: "leaves",
      rule: "Many words ending in -f change to -ves.",
      tip: "leaf → leaves.",
    },
    {
      word: "wolf",
      question: "One wolf → three ___",
      answers: ["wolfs", "wolves", "wolfes", "wolvies"],
      correct: "wolves",
      rule: "wolf changes f to v before adding -es.",
      tip: "wolf → wolves.",
    },
    {
      word: "knife",
      question: "One knife → two ___",
      answers: ["knifes", "knives", "knifees", "knivs"],
      correct: "knives",
      rule: "knife changes f to v before adding -es.",
      tip: "knife → knives.",
    },
    {
      word: "roof",
      question: "One roof → two ___",
      answers: ["rooves", "roofs", "roofes", "roovs"],
      correct: "roofs",
      rule: "Roof is an important exception. Standard modern English uses roofs.",
      tip: "Don't assume every -f word becomes -ves.",
    },
    {
      word: "tomato",
      question: "One tomato → several ___",
      answers: ["tomatos", "tomatoes", "tomati", "tomato"],
      correct: "tomatoes",
      rule: "Some nouns ending in -o take -es.",
      tip: "tomato → tomatoes.",
    },
  ],

  B1: [
    {
      word: "child",
      question: "There are three ___ playing outside.",
      answers: ["childs", "children", "childes", "childrens"],
      correct: "children",
      rule: "child has an irregular plural: children.",
      tip: "Do not add -s to child.",
    },
    {
      word: "mouse",
      question: "The farmer saw two ___",
      answers: ["mouses", "mouse", "mice", "mices"],
      correct: "mice",
      rule: "mouse → mice.",
      tip: "This is an irregular vowel change.",
    },
    {
      word: "tooth",
      question: "I brush my ___ twice a day.",
      answers: ["tooths", "teeth", "toothes", "tooth"],
      correct: "teeth",
      rule: "tooth → teeth.",
      tip: "The vowel changes.",
    },
    {
      word: "foot",
      question: "My ___ are cold.",
      answers: ["foots", "feet", "feets", "foot"],
      correct: "feet",
      rule: "foot → feet.",
      tip: "foot → feet.",
    },
    {
      word: "woman",
      question: "The two ___ are doctors.",
      answers: ["womans", "women", "womanes", "womens"],
      correct: "women",
      rule: "woman → women.",
      tip: "The vowel sound changes too.",
    },
    {
      word: "sheep",
      question: "The farmer owns twenty ___.",
      answers: ["sheeps", "sheep", "sheepes", "sheepen"],
      correct: "sheep",
      rule: "Some nouns have the same singular and plural form.",
      tip: "One sheep, two sheep.",
    },
  ],

  B2: [
    {
      word: "cactus",
      question: "The garden contains several ___.",
      answers: ["cactuses", "cacti", "cactus", "cactuseses"],
      correct: "cacti",
      rule: "Both cacti and cactuses are used in English.",
      tip: "Cacti is traditional; cactuses is also accepted.",
    },
    {
      word: "criterion",
      question: "The judges used several ___ to evaluate the entries.",
      answers: ["criterions", "criteria", "criterion", "criterias"],
      correct: "criteria",
      rule: "criterion → criteria.",
      tip: "This plural comes from Greek.",
    },
    {
      word: "phenomenon",
      question: "Scientists studied several natural ___.",
      answers: ["phenomenons", "phenomena", "phenomenas", "phenomenon"],
      correct: "phenomena",
      rule: "phenomenon → phenomena.",
      tip: "A common academic/scientific plural.",
    },
    {
      word: "analysis",
      question: "The report contains several detailed ___.",
      answers: ["analysises", "analysis", "analyses", "analysi"],
      correct: "analyses",
      rule: "analysis → analyses.",
      tip: "Words ending in -is often change to -es.",
    },
    {
      word: "thesis",
      question: "The university received several doctoral ___.",
      answers: ["thesises", "theses", "thesis", "thesisies"],
      correct: "theses",
      rule: "thesis → theses.",
      tip: "Notice the spelling and pronunciation change.",
    },
    {
      word: "formula",
      question: "The scientists tested several ___.",
      answers: ["formulas", "formulae", "both formulas and formulae", "formula"],
      correct: "both formulas and formulae",
      rule: "Both formulas and formulae are accepted plurals.",
      tip: "Formulae is traditional; formulas is very common.",
    },
  ],

  C1: [
    {
      word: "experience",
      context: "She has worked in education for twenty years.",
      question: "She has a lot of ___ in teaching.",
      answers: ["experiences", "experience", "experiencies", "experiencees"],
      correct: "experience",
      rule: "Experience is usually uncountable when referring to knowledge or skill.",
      tip: "But experiences can mean individual events.",
    },
    {
      word: "experience",
      context: "During her travels, she tried many unusual things.",
      question: "She had many interesting ___.",
      answers: ["experience", "experiences", "experiencies", "experiencees"],
      correct: "experiences",
      rule: "Experiences can mean individual events or things that happened.",
      tip: "Context changes the form.",
    },
    {
      word: "paper",
      context: "A university student submitted three research documents.",
      question: "The professor read three academic ___.",
      answers: ["paper", "papers", "paperes", "papery"],
      correct: "papers",
      rule: "Papers can mean documents or academic articles.",
      tip: "Paper is normally uncountable when referring to the material.",
    },
    {
      word: "work",
      context: "A museum is discussing individual paintings and sculptures.",
      question: "The museum acquired several ___ by contemporary artists.",
      answers: ["work", "works", "workes", "working"],
      correct: "works",
      rule: "Works can refer to individual artistic creations.",
      tip: "The plural changes the meaning.",
    },
    {
      word: "people",
      context: "Different cultural groups have lived in the region for centuries.",
      question: "The museum celebrates the indigenous ___ of the region.",
      answers: ["people", "peoples", "persons", "peopleses"],
      correct: "peoples",
      rule: "Peoples can refer to distinct cultural, ethnic or national groups.",
      tip: "People and peoples can have different meanings.",
    },
    {
      word: "advice",
      question: "My teacher gave me some useful ___.",
      answers: ["advices", "advice", "advise", "adviceses"],
      correct: "advice",
      rule: "Advice is uncountable.",
      tip: "Say 'some advice' or 'pieces of advice', not 'advices'.",
    },
  ],

  C2: [
    {
      word: "criterion",
      context: "The committee evaluated the proposals according to five specific requirements.",
      question: "Which sentence is most natural?",
      answers: [
        "The committee used five criteria.",
        "The committee used five criterions.",
        "The committee used five criterias.",
        "The committee used five criterion.",
      ],
      correct: "The committee used five criteria.",
      rule: "Criterion is singular; criteria is plural.",
      tip: "Advanced English requires precision as well as grammatical accuracy.",
    },
    {
      word: "phenomenon",
      context: "Scientists are discussing multiple unusual events.",
      question: "Which is correct in formal academic English?",
      answers: [
        "Several phenomena were observed.",
        "Several phenomenons were observed.",
        "Several phenomenas were observed.",
        "Several phenomenon were observed.",
      ],
      correct: "Several phenomena were observed.",
      rule: "The formal plural is phenomena.",
      tip: "Academic vocabulary often preserves classical plural forms.",
    },
    {
      word: "medium",
      context: "The artist uses painting, sculpture and photography.",
      question: "The artist works across several different ___.",
      answers: ["mediums", "media", "both can be correct depending on meaning", "medium"],
      correct: "both can be correct depending on meaning",
      rule: "Mediums and media can both be correct depending on context.",
      tip: "At C2, plural choice can depend on meaning and register.",
    },
    {
      word: "people",
      context: "The article compares several distinct ethnic groups.",
      question: "Which word best expresses the meaning?",
      answers: ["people", "peoples", "persons", "person"],
      correct: "peoples",
      rule: "Peoples can refer to distinct cultural, ethnic or national groups.",
      tip: "Plural choice can change meaning.",
    },
    {
      word: "damage",
      context: "An insurance company is describing harm caused by a storm.",
      question: "Which expression is most natural?",
      answers: [
        "The building suffered considerable damage.",
        "The building suffered considerable damages.",
        "The building suffered damagees.",
        "The building suffered many damage.",
      ],
      correct: "The building suffered considerable damage.",
      rule: "Damage is normally uncountable when referring to harm.",
      tip: "Advanced English often depends on countability.",
    },
    {
      word: "advice",
      context: "A teacher gives students several individual recommendations.",
      question: "Which is grammatically natural?",
      answers: [
        "She gave me several pieces of advice.",
        "She gave me several advices.",
        "She gave me several advice.",
        "She gave me several advises.",
      ],
      correct: "She gave me several pieces of advice.",
      rule: "Advice is uncountable.",
      tip: "Use 'pieces of advice' when counting individual recommendations.",
    },
  ],
};

const LEVELS = [
  { id: "A1", emoji: "🌱", name: "Plural Park", color: "green" },
  { id: "A2", emoji: "🌲", name: "Grammar Forest", color: "blue" },
  { id: "B1", emoji: "🏔️", name: "Irregular Mountains", color: "purple" },
  { id: "B2", emoji: "🏰", name: "Word Castle", color: "orange" },
  { id: "C1", emoji: "🌌", name: "Meaning Dimension", color: "pink" },
  { id: "C2", emoji: "👑", name: "Mastery Realm", color: "gold" },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function PluralQuest() {
  const [level, setLevel] = useState("A1");
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [mastery, setMastery] = useState({});

  const current = questions[questionIndex];
  const currentLevel = useMemo(() => LEVELS.find((item) => item.id === level), [level]);

  useEffect(() => {
    startLevel("A1");
  }, []);

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setQuestions(shuffle(QUESTIONS[nextLevel] || []));
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setSelected(null);
    setFinished(false);
  }

  function chooseLevel(nextLevel) {
    startLevel(nextLevel);
  }

  function answerQuestion(answer) {
    if (selected || !current) return;

    const correct = answer === current.correct;
    setSelected(answer);

    setMastery((previous) => {
      const old = previous[current.word] || { attempts: 0, correct: 0 };
      return {
        ...previous,
        [current.word]: {
          attempts: old.attempts + 1,
          correct: old.correct + (correct ? 1 : 0),
        },
      };
    });

    if (correct) {
      const newStreak = streak + 1;
      const earned = 100 + Math.min(newStreak * 10, 50);
      setStreak(newStreak);
      setScore((value) => value + earned);
      setXp((value) => value + earned);
    } else {
      setStreak(0);
      setLives((value) => Math.max(0, value - 1));
    }
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  }

  const masteryWords = Object.entries(mastery).slice(-4).reverse();
  if (!current && !finished) return null;

  return (
    <main className="plural-quest">
      <style>{`
        .plural-quest {
          min-height: 100%;
          width: 100%;
          padding: 18px;
          color: var(--text);
          background: linear-gradient(180deg, rgba(12,16,24,0.98), rgba(18,22,32,0.98));
        }
        .pq-header {
          display: flex; justify-content: space-between; gap: 14px; align-items: center; flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .pq-brand { display: flex; align-items: center; gap: 14px; }
        .pq-logo { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border-radius: 16px; font-size: 2rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); }
        .pq-brand h1 { margin: 0; font-size: 1.8rem; }
        .pq-brand p { margin: 2px 0 0; color: var(--muted); }
        .pq-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .pq-stat { min-width: 100px; padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); }
        .pq-stat span { display: block; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
        .pq-stat strong { font-size: 1.2rem; }
        .pq-world-panel, .pq-game-card, .pq-side-card {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 22px;
        }
        .pq-world-panel { padding: 18px 18px 14px; margin-bottom: 18px; }
        .pq-section-heading h2 { margin: 0; }
        .pq-section-heading p { margin: 6px 0 0; color: var(--muted); }
        .pq-levels { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-top: 16px; }
        .pq-level { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 10px; border-radius: 16px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); cursor: pointer; color: var(--text); }
        .pq-level.active { background: rgba(93,189,181,0.12); border-color: var(--teal); }
        .pq-level-emoji { font-size: 1.7rem; }
        .pq-layout { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(250px, 0.8fr); gap: 18px; }
        .pq-game-card { padding: 18px; }
        .pq-progress-track { height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
        .pq-progress { height: 100%; background: linear-gradient(135deg, var(--gold), var(--teal)); border-radius: inherit; }
        .pq-meta { display: flex; justify-content: space-between; align-items: center; margin: 12px 0; color: var(--muted); font-size: 0.8rem; }
        .pq-level-label { padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); }
        .pq-boss { display: inline-flex; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 12px; background: rgba(216,173,69,0.12); border: 1px solid rgba(216,173,69,0.28); }
        .pq-question h2 { margin: 18px 0 6px; font-size: clamp(1.35rem, 3vw, 2.1rem); }
        .pq-context { color: var(--muted); font-style: italic; margin: 14px 0 0; }
        .pq-question-mark { color: var(--gold); }
        .pq-hint { color: var(--muted); margin: 8px 0 18px; }
        .pq-answers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .pq-answer { padding: 14px 12px; border-radius: 14px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); cursor: pointer; }
        .pq-answer.correct { background: rgba(29,166,97,0.16); border-color: rgba(29,166,97,0.5); }
        .pq-answer.wrong { background: rgba(233,109,109,0.12); border-color: rgba(233,109,109,0.4); }
        .pq-feedback { margin-top: 18px; padding: 16px; border-radius: 16px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); }
        .pq-feedback.correct { border-color: rgba(29,166,97,0.5); background: rgba(29,166,97,0.12); }
        .pq-feedback.wrong { border-color: rgba(233,109,109,0.4); background: rgba(233,109,109,0.12); }
        .pq-rule { margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.03); }
        .pq-next { display: block; width: 100%; margin-top: 16px; border: none; padding: 12px 18px; border-radius: 12px; color: white; background: linear-gradient(135deg, var(--gold), var(--teal)); cursor: pointer; font-weight: 800; }
        .pq-sidebar { display: grid; gap: 16px; }
        .pq-side-card { padding: 16px; }
        .pq-side-card h3 { margin: 0 0 10px; }
        .pq-muted { color: var(--muted); }
        .pq-mastery { display: grid; gap: 12px; }
        .pq-mastery-item { display: grid; gap: 6px; }
        .pq-mastery-top { display: flex; justify-content: space-between; }
        .pq-mini-track { height: 8px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.06); }
        .pq-mini-track div { height: 100%; background: linear-gradient(135deg, var(--teal), var(--gold)); border-radius: inherit; }
        .pq-level-info { display: flex; align-items: center; gap: 14px; }
        .pq-world-icon { font-size: 2rem; }
        .pq-results { text-align: center; padding: 20px 10px; }
        .pq-trophy { font-size: 4rem; }
        .pq-final-score { font-size: 2.2rem; font-weight: 800; margin: 16px 0; }
        .pq-result-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
        .pq-result-stats div { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 14px; padding: 12px; }
        .pq-result-stats strong { display: block; font-size: 1.3rem; }
        .pq-replay { margin-top: 20px; border: none; background: linear-gradient(135deg, var(--gold), var(--teal)); padding: 12px 18px; border-radius: 12px; color: white; font-weight: 800; cursor: pointer; }
        @media (max-width: 860px) { .pq-layout { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .pq-answers { grid-template-columns: 1fr; } }
      `}</style>

      <header className="pq-header">
        <div className="pq-brand">
          <div className="pq-logo">🔤</div>
          <div>
            <h1>Plural Quest</h1>
            <p>Master English plurals</p>
          </div>
        </div>

        <div className="pq-stats">
          <div className="pq-stat">
            <span>XP</span>
            <strong>{xp}</strong>
          </div>
          <div className="pq-stat">
            <span>🔥 Streak</span>
            <strong>{streak}</strong>
          </div>
          <div className="pq-stat">
            <span>❤️ Lives</span>
            <strong>{lives}</strong>
          </div>
        </div>
      </header>

      <section className="pq-world-panel">
        <div className="pq-section-heading">
          <div>
            <h2>Choose your world</h2>
            <p>Progress from basic plurals to advanced English nuance.</p>
          </div>
        </div>

        <div className="pq-levels">
          {LEVELS.map((item) => (
            <button key={item.id} className={`pq-level ${level === item.id ? "active" : ""}`} onClick={() => chooseLevel(item.id)}>
              <span className="pq-level-emoji">{item.emoji}</span>
              <strong>{item.id}</strong>
              <small>{item.name}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="pq-layout">
        <section className="pq-game-card">
          {!finished ? (
            <>
              <div className="pq-progress-track">
                <div className="pq-progress" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
              </div>

              <div className="pq-meta">
                <span>Question {questionIndex + 1} / {questions.length}</span>
                <span className="pq-level-label">{currentLevel?.emoji} {level}</span>
              </div>

              {questionIndex === questions.length - 1 && (
                <div className="pq-boss">👑 <strong>BOSS ROUND</strong> <span>Master this challenge to complete the level!</span></div>
              )}

              <div className="pq-question">
                {current.context && <p className="pq-context">{current.context}</p>}

                <h2>
                  {current.question.split("___").map((part, index, arr) => (
                    <span key={index}>
                      {part}
                      {index < arr.length - 1 && <span className="pq-question-mark">?</span>}
                    </span>
                  ))}
                </h2>

                <p className="pq-hint">{level === "C1" || level === "C2" ? "Choose the most natural answer." : "Choose the correct plural."}</p>

                <div className="pq-answers">
                  {current.answers.map((answer) => {
                    const isCorrect = answer === current.correct;
                    const isSelected = answer === selected;
                    let className = "pq-answer";
                    if (selected && isCorrect) className += " correct";
                    if (selected && isSelected && !isCorrect) className += " wrong";

                    return (
                      <button key={answer} className={className} onClick={() => answerQuestion(answer)} disabled={Boolean(selected)}>
                        {answer}
                      </button>
                    );
                  })}
                </div>

                {selected && (
                  <div className={`pq-feedback ${selected === current.correct ? "correct" : "wrong"}`}>
                    <strong>{selected === current.correct ? "✓ Correct!" : "✗ Not quite"}</strong>
                    <p>
                      {selected !== current.correct && <><span>Correct answer: <b>{current.correct}</b> — </span></>}
                      {current.tip}
                    </p>
                    <div className="pq-rule"><span>📖 Rule</span> {current.rule}</div>
                    <button className="pq-next" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "Finish Level →" : "Next Question →"}</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="pq-results">
              <div className="pq-trophy">🏆</div>
              <h2>Level Complete!</h2>
              <p>{score >= questions.length * 120 ? "Outstanding! You've mastered this level." : "Great work! Keep practising those tricky plurals."}</p>
              <div className="pq-final-score">{score} XP</div>
              <div className="pq-result-stats">
                <div><strong>{score}</strong><span>Score</span></div>
                <div><strong>{streak}</strong><span>Streak</span></div>
                <div><strong>{level}</strong><span>Level</span></div>
              </div>
              <button className="pq-replay" onClick={() => startLevel(level)}>Play Again</button>
            </div>
          )}
        </section>

        <aside className="pq-sidebar">
          <div className="pq-side-card">
            <h3>📖 Current Rule</h3>
            <p>{current?.rule || "Answer questions to discover the rule."}</p>
          </div>

          <div className="pq-side-card">
            <h3>🧠 Word Mastery</h3>
            {masteryWords.length === 0 ? (
              <p className="pq-muted">Answer questions to build your word mastery.</p>
            ) : (
              <div className="pq-mastery">
                {masteryWords.map(([word, data]) => {
                  const percentage = Math.round((data.correct / data.attempts) * 100);
                  return (
                    <div className="pq-mastery-item" key={word}>
                      <div className="pq-mastery-top"><strong>{word}</strong><span>{percentage}%</span></div>
                      <div className="pq-mini-track"><div style={{ width: `${percentage}%` }} /></div>
                      <small>{data.correct}/{data.attempts} correct</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pq-side-card">
            <h3>💡 Tip</h3>
            <p>{current?.tip || "Look at the whole sentence, not just the word."}</p>
          </div>

          <div className="pq-side-card pq-level-info">
            <div className="pq-world-icon">{currentLevel?.emoji}</div>
            <div>
              <strong>{currentLevel?.name}</strong>
              <span>{level} Grammar</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
