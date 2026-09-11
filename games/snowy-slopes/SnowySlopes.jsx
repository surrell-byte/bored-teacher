import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import './SnowySlopes.css';

const PHONICS = {
  beginner: {
    sounds: [
      { g: 'b', s: '/b/', words: ['bat', 'ball', 'bed'], emoji: '🦇' },
      { g: 'c', s: '/k/', words: ['cat', 'cup', 'cake'], emoji: '🐱' },
      { g: 'd', s: '/d/', words: ['dog', 'door', 'duck'], emoji: '🐶' },
      { g: 'f', s: '/f/', words: ['fish', 'fan', 'fox'], emoji: '🐟' },
      { g: 'g', s: '/g/', words: ['go', 'gum', 'game'], emoji: '🎮' },
      { g: 'h', s: '/h/', words: ['hat', 'hen', 'house'], emoji: '🏠' },
      { g: 'j', s: '/dʒ/', words: ['jam', 'jet', 'jump'], emoji: '🚀' },
      { g: 'k', s: '/k/', words: ['kite', 'king', 'key'], emoji: '🪁' },
      { g: 'l', s: '/l/', words: ['leg', 'lion', 'leaf'], emoji: '🦁' },
      { g: 'm', s: '/m/', words: ['man', 'moon', 'mouse'], emoji: '🐭' },
      { g: 'n', s: '/n/', words: ['nose', 'net', 'nest'], emoji: '🪺' },
      { g: 'p', s: '/p/', words: ['pen', 'pig', 'pizza'], emoji: '🐷' },
      { g: 'r', s: '/r/', words: ['red', 'run', 'rabbit'], emoji: '🐰' },
      { g: 's', s: '/s/', words: ['sun', 'sock', 'snake'], emoji: '☀️' },
      { g: 't', s: '/t/', words: ['top', 'ten', 'tree'], emoji: '🌳' },
      { g: 'v', s: '/v/', words: ['van', 'vest', 'violin'], emoji: '🚐' },
      { g: 'w', s: '/w/', words: ['wet', 'web', 'wolf'], emoji: '🐺' },
      { g: 'z', s: '/z/', words: ['zoo', 'zip', 'zero'], emoji: '🦓' },
      { g: 'a', s: '/æ/', words: ['cat', 'map', 'hat'], emoji: '🐱' },
      { g: 'e', s: '/e/', words: ['bed', 'red', 'hen'], emoji: '🛏️' },
      { g: 'i', s: '/ɪ/', words: ['sit', 'pig', 'fish'], emoji: '🐟' },
      { g: 'o', s: '/ɒ/', words: ['hot', 'dog', 'box'], emoji: '🔥' },
      { g: 'u', s: '/ʌ/', words: ['cup', 'sun', 'bus'], emoji: '🚌' },
      { g: 'sh', s: '/ʃ/', words: ['ship', 'shop', 'fish'], emoji: '🚢' },
      { g: 'ch', s: '/tʃ/', words: ['chair', 'chip', 'chicken'], emoji: '🐔' },
      { g: 'th', s: '/θ/', words: ['thin', 'three', 'thumb'], emoji: '👍' },
      { g: 'wh', s: '/w/', words: ['when', 'wheel', 'whale'], emoji: '🐋' },
      { g: 'ph', s: '/f/', words: ['phone', 'photo', 'graph'], emoji: '📱' },
      { g: 'bl', s: '/bl/', words: ['blue', 'black', 'block'], emoji: '🔵' },
      { g: 'cl', s: '/kl/', words: ['clap', 'clock', 'clean'], emoji: '👏' },
      { g: 'fl', s: '/fl/', words: ['flag', 'flower', 'flip'], emoji: '🌸' },
      { g: 'gl', s: '/gl/', words: ['glue', 'glass', 'glow'], emoji: '✨' },
      { g: 'pl', s: '/pl/', words: ['plane', 'play', 'plate'], emoji: '✈️' },
      { g: 'sl', s: '/sl/', words: ['slide', 'sleep', 'slow'], emoji: '😴' },
      { g: 'br', s: '/br/', words: ['bread', 'brown', 'brush'], emoji: '🍞' },
      { g: 'cr', s: '/kr/', words: ['crab', 'cry', 'crown'], emoji: '🦀' },
      { g: 'dr', s: '/dr/', words: ['drum', 'dress', 'drink'], emoji: '🥁' },
      { g: 'fr', s: '/fr/', words: ['frog', 'fruit', 'free'], emoji: '🐸' },
      { g: 'gr', s: '/gr/', words: ['green', 'grass', 'grape'], emoji: '🍇' },
      { g: 'pr', s: '/pr/', words: ['prize', 'press', 'pretty'], emoji: '🏆' },
      { g: 'tr', s: '/tr/', words: ['tree', 'train', 'truck'], emoji: '🚂' },
      { g: 'st', s: '/st/', words: ['star', 'stop', 'stone'], emoji: '⭐' },
      { g: 'sp', s: '/sp/', words: ['spoon', 'spin', 'spot'], emoji: '🥄' },
      { g: 'sn', s: '/sn/', words: ['snow', 'snake', 'snail'], emoji: '🐌' },
      { g: 'sm', s: '/sm/', words: ['smile', 'small', 'smoke'], emoji: '😊' },
      { g: 'sk', s: '/sk/', words: ['ski', 'skin', 'skip'], emoji: '⛷️' },
      { g: 'sw', s: '/sw/', words: ['swim', 'swan', 'swing'], emoji: '🦢' },
      { g: 'a_e', s: '/eɪ/', words: ['cake', 'game', 'name'], emoji: '🎂' },
      { g: 'e_e', s: '/iː/', words: ['these', 'theme', 'complete'], emoji: '📚' },
      { g: 'i_e', s: '/aɪ/', words: ['kite', 'bike', 'time'], emoji: '🚲' },
      { g: 'o_e', s: '/oʊ/', words: ['home', 'bone', 'rope'], emoji: '🏠' },
      { g: 'u_e', s: '/juː/', words: ['cube', 'cute', 'tube'], emoji: '🧊' },
    ],
    words: [
      ['cat', 'c_t', 'a', '🐱'],
      ['bed', 'b_d', 'e', '🛏️'],
      ['pig', 'p_g', 'i', '🐷'],
      ['dog', 'd_g', 'o', '🐶'],
      ['sun', 's_n', 'u', '☀️'],
      ['ship', '_ip', 'sh', '🚢'],
      ['chair', '_air', 'ch', '🪑'],
      ['fish', 'fi__', 'sh', '🐟'],
      ['blue', '__ue', 'bl', '🔵'],
      ['frog', '__og', 'fr', '🐸'],
      ['tree', '__ee', 'tr', '🌳'],
      ['snow', 's__w', 'no', '❄️'],
      ['cake', 'c__e', 'ak', '🎂'],
      ['kite', 'k__e', 'it', '🪁'],
      ['home', 'h__e', 'om', '🏠'],
      ['bike', 'b__e', 'ik', '🚲'],
    ],
    spellings: [
      ['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['fish', '🐟'], ['frog', '🐸'],
      ['snow', '❄️'], ['cake', '🎂'], ['kite', '🪁'], ['tree', '🌳'], ['ship', '🚢'],
      ['blue', '🔵'], ['house', '🏠'], ['pizza', '🍕'], ['rabbit', '🐰'],
    ],
  },

  intermediate: {
    sounds: [
      { g: 'ee', s: '/iː/', words: ['tree', 'green', 'sleep'], emoji: '🌳' },
      { g: 'ea', s: '/iː/', words: ['beach', 'team', 'eat'], emoji: '🏖️' },
      { g: 'ai', s: '/eɪ/', words: ['rain', 'train', 'paint'], emoji: '🌧️' },
      { g: 'ay', s: '/eɪ/', words: ['day', 'play', 'stay'], emoji: '☀️' },
      { g: 'oa', s: '/oʊ/', words: ['boat', 'road', 'goat'], emoji: '⛵' },
      { g: 'ow', s: '/oʊ/', words: ['snow', 'show', 'yellow'], emoji: '❄️' },
      { g: 'oo', s: '/uː/', words: ['moon', 'food', 'school'], emoji: '🌙' },
      { g: 'ou', s: '/aʊ/', words: ['house', 'cloud', 'mouse'], emoji: '🏠' },
      { g: 'oi', s: '/ɔɪ/', words: ['coin', 'point', 'join'], emoji: '🪙' },
      { g: 'oy', s: '/ɔɪ/', words: ['boy', 'toy', 'enjoy'], emoji: '🧸' },
      { g: 'igh', s: '/aɪ/', words: ['night', 'light', 'right'], emoji: '🌙' },
      { g: 'ie', s: '/aɪ/', words: ['pie', 'tie', 'cries'], emoji: '🥧' },
      { g: 'y', s: '/aɪ/', words: ['my', 'fly', 'cry'], emoji: '🪰' },
      { g: 'ar', s: '/ɑːr/', words: ['car', 'star', 'farm'], emoji: '🚗' },
      { g: 'or', s: '/ɔːr/', words: ['fork', 'storm', 'horse'], emoji: '🐴' },
      { g: 'er', s: '/ɜːr/', words: ['her', 'fern', 'term'], emoji: '🌿' },
      { g: 'ir', s: '/ɜːr/', words: ['bird', 'girl', 'shirt'], emoji: '🐦' },
      { g: 'ur', s: '/ɜːr/', words: ['turn', 'burn', 'church'], emoji: '🔥' },
      { g: 'tch', s: '/tʃ/', words: ['match', 'catch', 'watch'], emoji: '⌚' },
      { g: 'dge', s: '/dʒ/', words: ['bridge', 'badge', 'fridge'], emoji: '🌉' },
      { g: 'ck', s: '/k/', words: ['duck', 'clock', 'black'], emoji: '🦆' },
      { g: 'ng', s: '/ŋ/', words: ['sing', 'ring', 'long'], emoji: '💍' },
      { g: 'kn', s: '/n/', words: ['knee', 'knife', 'knock'], emoji: '🦵' },
      { g: 'wr', s: '/r/', words: ['write', 'wrong', 'wrist'], emoji: '✍️' },
      { g: 'mb', s: '/m/', words: ['lamb', 'thumb', 'climb'], emoji: '🐑' },
      { g: 'lk', s: '/k/', words: ['walk', 'talk', 'chalk'], emoji: '🚶' },
      { g: 'gh', s: 'silent', words: ['night', 'light', 'right'], emoji: '🌙' },
      { g: 'tion', s: '/ʃən/', words: ['station', 'nation', 'action'], emoji: '🚉' },
      { g: 'sion', s: '/ʒən/', words: ['vision', 'decision', 'television'], emoji: '📺' },
      { g: 'cian', s: '/ʃən/', words: ['musician', 'politician', 'magician'], emoji: '🎩' },
      { g: 'ure', s: '/tʃə/', words: ['future', 'nature', 'picture'], emoji: '🔮' },
      { g: 'eigh', s: '/eɪ/', words: ['eight', 'weight', 'neighbour'], emoji: '8️⃣' },
    ],
    words: [
      ['rain', 'r__n', 'ai', '🌧️'],
      ['train', 'tr__n', 'ai', '🚂'],
      ['boat', 'b__t', 'oa', '⛵'],
      ['snow', 's__w', 'no', '❄️'],
      ['moon', 'm__n', 'oo', '🌙'],
      ['house', 'h__se', 'ou', '🏠'],
      ['coin', 'c__n', 'oi', '🪙'],
      ['night', 'n__t', 'igh', '🌙'],
      ['bird', 'b__d', 'ir', '🐦'],
      ['turn', 't__n', 'ur', '🔄'],
      ['horse', 'h__se', 'or', '🐴'],
      ['bridge', 'bri__e', 'dg', '🌉'],
      ['knee', '__ee', 'kn', '🦵'],
      ['write', '__ite', 'wr', '✍️'],
      ['lamb', 'la__', 'mb', '🐑'],
      ['station', 'sta__', 'tion', '🚉'],
      ['musician', 'musi__', 'cian', '🎵'],
      ['future', 'fu__', 'ture', '🔮'],
    ],
    spellings: [
      ['rain', '🌧️'], ['train', '🚂'], ['school', '🏫'], ['house', '🏠'], ['mouse', '🐭'],
      ['night', '🌙'], ['light', '💡'], ['bird', '🐦'], ['horse', '🐴'], ['bridge', '🌉'],
      ['knee', '🦵'], ['write', '✍️'], ['lamb', '🐑'], ['climb', '🧗'], ['station', '🚉'],
      ['picture', '🖼️'],
    ],
  },

  advanced: {
    sounds: [
      { g: 'schwa', s: '/ə/', words: ['about', 'banana', 'support'], emoji: '🔤' },
      { g: 'ough', s: '/f/', words: ['cough', 'enough', 'rough'], emoji: '😷' },
      { g: 'ough', s: '/oʊ/', words: ['though', 'although', 'dough'], emoji: '🍞' },
      { g: 'ough', s: '/uː/', words: ['through'], emoji: '➡️' },
      { g: 'ough', s: '/aʊ/', words: ['bough'], emoji: '🌳' },
      { g: 'augh', s: '/ɔː/', words: ['daughter', 'caught', 'taught'], emoji: '👧' },
      { g: 'ea', s: '/e/', words: ['bread', 'head', 'ready'], emoji: '🍞' },
      { g: 'ea', s: '/ɜː/', words: ['learn', 'heard', 'earth'], emoji: '🌍' },
      { g: 'ou', s: '/ʌ/', words: ['young', 'touch', 'country'], emoji: '🌎' },
      { g: 'oo', s: '/ʊ/', words: ['book', 'good', 'foot'], emoji: '📖' },
      { g: 'tion', s: '/ʃən/', words: ['education', 'information', 'celebration'], emoji: '🎓' },
      { g: 'sion', s: '/ʃən/', words: ['discussion', 'permission', 'expression'], emoji: '💬' },
      { g: 'ity', s: '/əti/', words: ['ability', 'activity', 'community'], emoji: '🏘️' },
      { g: 'ous', s: '/əs/', words: ['famous', 'dangerous', 'curious'], emoji: '⭐' },
      { g: 'ment', s: '/mənt/', words: ['movement', 'payment', 'development'], emoji: '🏃' },
      { g: 'able', s: '/əbəl/', words: ['comfortable', 'readable', 'washable'], emoji: '🛋️' },
      { g: 'ible', s: '/əbəl/', words: ['possible', 'visible', 'terrible'], emoji: '👀' },
      { g: 'str', s: '/str/', words: ['street', 'strong', 'string'], emoji: '🛣️' },
      { g: 'spr', s: '/spr/', words: ['spring', 'spray', 'spread'], emoji: '🌸' },
      { g: 'scr', s: '/skr/', words: ['screen', 'scream', 'scrape'], emoji: '📺' },
      { g: 'spl', s: '/spl/', words: ['splash', 'split', 'splendid'], emoji: '💦' },
      { g: 'squ', s: '/skw/', words: ['square', 'squeeze', 'squid'], emoji: '🦑' },
      { g: 'thr', s: '/θr/', words: ['three', 'throw', 'through'], emoji: '3️⃣' },
      { g: 'shr', s: '/ʃr/', words: ['shrink', 'shrimp', 'shrub'], emoji: '🦐' },
      { g: 'c', s: '/s/', words: ['city', 'cent', 'cycle'], emoji: '🏙️' },
      { g: 'g', s: '/dʒ/', words: ['giant', 'gym', 'gem'], emoji: '💎' },
      { g: 'kn', s: '/n/', words: ['knowledge', 'knight', 'knock'], emoji: '🧠' },
      { g: 'gn', s: '/n/', words: ['gnome', 'gnaw', 'gnat'], emoji: '🍄' },
      { g: 'wr', s: '/r/', words: ['wrestle', 'wreck', 'write'], emoji: '✍️' },
      { g: 'bt', s: '/t/', words: ['debt', 'doubt', 'subtle'], emoji: '💰' },
      { g: '-s', s: '/z/', words: ['dogs', 'bags', 'cars'], emoji: '🐶' },
      { g: '-ed', s: '/t/', words: ['walked', 'washed', 'jumped'], emoji: '🚶' },
      { g: '-ed', s: '/d/', words: ['played', 'cleaned', 'called'], emoji: '🎮' },
      { g: '-ed', s: '/ɪd/', words: ['wanted', 'needed', 'started'], emoji: '🚀' },
    ],
    words: [
      ['cough', 'c__gh', 'ou', '😷'],
      ['though', 'th__gh', 'ou', '🤔'],
      ['through', 'thr__gh', 'ou', '➡️'],
      ['bread', 'br__d', 'ea', '🍞'],
      ['learn', 'l__rn', 'ea', '📚'],
      ['young', 'y__ng', 'ou', '👦'],
      ['book', 'b__k', 'oo', '📖'],
      ['education', 'educa__', 'tion', '🎓'],
      ['decision', 'deci__', 'sion', '🤔'],
      ['activity', 'activ__', 'ity', '🏃'],
      ['famous', 'fam__', 'ous', '⭐'],
      ['movement', 'move__', 'ment', '🏃'],
      ['possible', 'poss__', 'ible', '✅'],
      ['street', '__eet', 'str', '🛣️'],
      ['spring', '__ing', 'spr', '🌸'],
      ['splash', '__ash', 'spl', '💦'],
      ['square', '__uare', 'squ', '⬜'],
      ['three', '__ree', 'thr', '3️⃣'],
      ['shrink', '__ink', 'shr', '📉'],
      ['city', '__ty', 'ci', '🏙️'],
      ['giant', '__ant', 'gi', '👹'],
    ],
    spellings: [
      ['cough', '😷'], ['though', '🤔'], ['through', '➡️'], ['daughter', '👧'], ['bread', '🍞'],
      ['learn', '📚'], ['young', '👦'], ['book', '📖'], ['education', '🎓'], ['decision', '🤔'],
      ['ability', '💪'], ['famous', '⭐'], ['movement', '🏃'], ['possible', '✅'], ['street', '🛣️'],
      ['spring', '🌸'], ['splash', '💦'], ['square', '⬜'], ['three', '3️⃣'], ['knowledge', '🧠'],
    ],
  },
};

const QUESTIONS_PER_GAME = 10;

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function unique(array) {
  return [...new Set(array)];
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function AmbientScene({ flakeCount = 30 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: flakeCount }, () => ({
        left: Math.random() * 100,
        duration: 4 + Math.random() * 7,
        delay: Math.random() * 6,
        size: 0.7 + Math.random() * 1.1,
      })),
    [flakeCount]
  );

  return (
    <div className="ss-scene" aria-hidden="true">
      <div className="ss-aurora" />
      <svg className="ss-ridge far" viewBox="0 0 1200 300" preserveAspectRatio="none">
        <path d="M0,300 L0,180 L160,60 L320,160 L520,30 L720,150 L920,50 L1080,140 L1200,90 L1200,300 Z" fill="#3a6798" />
      </svg>
      <svg className="ss-ridge near" viewBox="0 0 1200 260" preserveAspectRatio="none">
        <path d="M0,260 L0,140 L200,220 L380,90 L560,200 L760,70 L960,190 L1200,110 L1200,260 Z" fill="#f4faff" />
      </svg>
      <div className="ss-snowfield">
        {flakes.map((f, i) => (
          <span
            key={i}
            className="ss-flake"
            style={{
              left: `${f.left}%`,
              fontSize: `${f.size}rem`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            ❄
          </span>
        ))}
      </div>
    </div>
  );
}

function Rider({ className = '' }) {
  return (
    <div className={`ss-rider ${className}`}> 
      <div className="ss-rider-hat" />
      <div className="ss-rider-head" />
      <div className="ss-rider-body" />
      <div className="ss-rider-leg l" />
      <div className="ss-rider-leg r" />
      <div className="ss-rider-board" />
    </div>
  );
}

export default function SnowySlopes() {
  const [screen, setScreen] = useState('start');
  const [mode, setMode] = useState('beginner');
  const [level, setLevel] = useState(1);

  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(0);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [gameOverFlag, setGameOverFlag] = useState(false);

  const [answered, setAnswered] = useState(null);
  const [spellValue, setSpellValue] = useState('');
  const [crash, setCrash] = useState(false);
  const [boost, setBoost] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'good', show: false });

  const audioCtxRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const spellInputRef = useRef(null);
  const advanceTimerRef = useRef(null);

  const currentQuestion = questions[questionIndex] || null;

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    return audioCtxRef.current;
  }, []);

  const tone = useCallback((frequency, duration, type = 'sine') => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // audio not available
    }
  }, [getAudioCtx]);

  const playCorrect = useCallback(() => {
    tone(523, 0.12);
    setTimeout(() => tone(659, 0.12), 100);
    setTimeout(() => tone(784, 0.2), 200);
  }, [tone]);

  const playWrong = useCallback(() => tone(180, 0.2, 'sawtooth'), [tone]);

  const playVictory = useCallback(() => {
    tone(523, 0.15);
    setTimeout(() => tone(659, 0.15), 150);
    setTimeout(() => tone(784, 0.15), 300);
    setTimeout(() => tone(1047, 0.4), 450);
  }, [tone]);

  const speakWord = useCallback((word) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.7;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }, []);

  const speakCurrent = useCallback(() => {
    if (!currentQuestion) return;
    if (level === 3) speakWord(currentQuestion[0]);
    else if (level === 1) speakWord(currentQuestion.words[0]);
    else if (level === 2) speakWord(currentQuestion[0]);
  }, [currentQuestion, level, speakWord]);

  const showFeedback = useCallback((text, good) => {
    setFeedback({ text, type: good ? 'good' : 'bad', show: true });
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback((f) => ({ ...f, show: false }));
    }, 850);
  }, []);

  const createQuestions = useCallback((m, lvl) => {
    const data = PHONICS[m];
    let source;
    if (lvl === 1) source = data.sounds;
    if (lvl === 2) source = data.words;
    if (lvl === 3) source = data.spellings;
    return shuffle([...source]).slice(0, Math.min(QUESTIONS_PER_GAME, source.length));
  }, []);

  const startGame = useCallback((selectedLevel) => {
    setLevel(selectedLevel);
    setLives(3);
    setCoins(0);
    setXp(0);
    setScore(0);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setQuestionIndex(0);
    setGameOverFlag(false);
    setAnswered(null);
    setSpellValue('');
    setCrash(false);
    setQuestions(createQuestions(mode, selectedLevel));
    setScreen('game');
  }, [mode, createQuestions]);

  const restartGame = useCallback(() => startGame(level), [startGame, level]);
  const goToModeScreen = useCallback(() => setScreen('mode'), []);

  const selectMode = useCallback((selected) => {
    setMode(selected);
    setScreen('level');
  }, []);

  const backToLevels = useCallback(() => setScreen('level'), []);

  const completeGame = useCallback((isGameOver = false) => {
    setGameOverFlag(isGameOver);
    if (!isGameOver) playVictory();
    setScreen('complete');
  }, [playVictory]);

  useEffect(() => {
    if (screen !== 'game' || level !== 3 || !currentQuestion) return;
    setSpellValue('');
    const t = setTimeout(() => {
      spellInputRef.current?.focus();
      speakWord(currentQuestion[0]);
    }, 300);
    return () => clearTimeout(t);
  }, [screen, level, questionIndex, currentQuestion, speakWord]);

  useEffect(() => {
    setAnswered(null);
    setCrash(false);
  }, [questionIndex]);

  const nextQuestion = useCallback(() => {
    setQuestionIndex((i) => {
      const next = i + 1;
      if (next >= questions.length) {
        completeGame(false);
        return i;
      }
      return next;
    });
  }, [questions.length, completeGame]);

  const registerMistake = useCallback(() => {
    setLives((prevLives) => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => completeGame(true), 1100);
      } else {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => nextQuestion(), 1000);
      }
      return newLives;
    });
  }, [completeGame, nextQuestion]);

  const checkAnswer = useCallback((isCorrect, chosenValue, correctValue) => {
    if (answered) return;
    setAnswered({ chosen: chosenValue, correctValue });
    setTotalAnswers((t) => t + 1);

    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
      setCoins((c) => c + 10);
      setXp((x) => x + 10);
      setScore((s) => s + 100);
      showFeedback('⭐ Correct! +10 coins +10 XP', true);
      playCorrect();
      setBoost(true);
      setTimeout(() => setBoost(false), 500);
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => nextQuestion(), 900);
    } else {
      setScore((s) => Math.max(0, s - 25));
      showFeedback('❄️ Not quite! Watch out!', false);
      playWrong();
      setCrash(true);
      registerMistake();
    }
  }, [answered, showFeedback, playCorrect, playWrong, nextQuestion, registerMistake]);

  const submitSpelling = useCallback(() => {
    if (!currentQuestion) return;
    const input = spellValue.trim().toLowerCase();
    if (!input) return;

    setTotalAnswers((t) => t + 1);
    const correct = input === currentQuestion[0].toLowerCase();

    if (correct) {
      setCorrectAnswers((c) => c + 1);
      setCoins((c) => c + 15);
      setXp((x) => x + 15);
      setScore((s) => s + 150);
      showFeedback('🏆 Perfect spelling! +15 coins', true);
      playCorrect();
      setBoost(true);
      setTimeout(() => setBoost(false), 500);
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => nextQuestion(), 1000);
    } else {
      setScore((s) => Math.max(0, s - 30));
      showFeedback(`❄️ The word was "${currentQuestion[0]}"`, false);
      playWrong();
      setCrash(true);
      registerMistake();
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setSpellValue('');
        spellInputRef.current?.focus();
      }, 1000);
    }
  }, [currentQuestion, spellValue, showFeedback, playCorrect, playWrong, nextQuestion, registerMistake]);

  useEffect(() => {
    function handleKey(e) {
      if (screen !== 'game' || level === 3) return;
      const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
      if (idx === undefined) return;
      const btn = document.querySelectorAll('.ss-answer-btn')[idx];
      btn?.click();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [screen, level]);

  useEffect(() => () => {
    clearTimeout(feedbackTimerRef.current);
    clearTimeout(advanceTimerRef.current);
  }, []);

  const choiceSet = useMemo(() => {
    if (!currentQuestion || screen !== 'game') return [];

    if (level === 1) {
      const correct = currentQuestion.s;
      const allSounds = PHONICS[mode].sounds.map((x) => x.s).filter((x) => x !== correct);
      const distractors = unique(shuffle(allSounds)).slice(0, 2);
      return shuffle([correct, ...distractors]);
    }

    if (level === 2) {
      const correct = currentQuestion[2];
      const candidates = [];
      PHONICS[mode].sounds.forEach((item) => {
        if (item.g !== correct && !candidates.includes(item.g)) candidates.push(item.g);
      });
      const distractors = shuffle(candidates).slice(0, 2);
      return shuffle([correct, ...distractors]);
    }

    return [];
  }, [currentQuestion, level, mode, screen]);

  const playerStyle = useMemo(() => {
    const progress = questionIndex / Math.max(1, questions.length - 1);
    const left = 8 + progress * 78;
    const top = 40 + Math.sin(progress * Math.PI * 2) * 14;
    return { left: `${left}%`, top: `${top}%` };
  }, [questionIndex, questions.length]);

  const progressPct = questions.length
    ? Math.min(100, (questionIndex / questions.length) * 100)
    : 0;

  const accuracy = totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100);

  function renderQuestionBody() {
    if (!currentQuestion) return null;

    if (level === 1) {
      return (
        <>
          <div className="ss-question-title">What sound does this make?</div>
          <div className="ss-picture">{currentQuestion.emoji || ''}</div>
          <div className="ss-question-word">{currentQuestion.g.toUpperCase()}</div>
          <button className="ss-speak-btn" onClick={speakCurrent}>🔊 Hear it</button>
          <div className="ss-answers">
            {choiceSet.map((answer, i) => {
              const isCorrect = answer === currentQuestion.s;
              const cls =
                answered && answered.chosen === answer
                  ? isCorrect
                    ? 'correct'
                    : 'wrong'
                  : answered && isCorrect
                  ? 'correct'
                  : '';
              return (
                <button
                  key={i}
                  className={`ss-answer-btn ${cls}`}
                  disabled={!!answered}
                  onClick={() => checkAnswer(isCorrect, answer, currentQuestion.s)}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (level === 2) {
      const correct = currentQuestion[2];
      return (
        <>
          <div className="ss-question-title">Choose the sound or letters that complete the word.</div>
          <div className="ss-picture">{currentQuestion[3]}</div>
          <div className="ss-question-word">{currentQuestion[1].toUpperCase()}</div>
          <button className="ss-speak-btn" onClick={speakCurrent}>🔊 Hear it</button>
          <div className="ss-answers">
            {choiceSet.map((answer, i) => {
              const isCorrect = answer === correct;
              const cls =
                answered && answered.chosen === answer
                  ? isCorrect
                    ? 'correct'
                    : 'wrong'
                  : answered && isCorrect
                  ? 'correct'
                  : '';
              return (
                <button
                  key={i}
                  className={`ss-answer-btn ${cls}`}
                  disabled={!!answered}
                  onClick={() => checkAnswer(isCorrect, answer, correct)}
                >
                  {answer.toUpperCase()}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="ss-question-title">Listen and spell the word!</div>
        <div className="ss-picture">{currentQuestion[1]}</div>
        <div className="ss-question-word">???</div>
        <button className="ss-speak-btn" onClick={speakCurrent}>🔊 Hear it</button>
        <input
          ref={spellInputRef}
          className="ss-spell-input"
          autoComplete="off"
          autoCapitalize="none"
          placeholder="Type the word..."
          value={spellValue}
          onChange={(e) => setSpellValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitSpelling();
          }}
        />
        <button className="ss-submit-spell" onClick={submitSpelling}>
          Check spelling ✓
        </button>
      </>
    );
  }

  return (
    <div className="snowy-slopes">
      {screen === 'start' && (
        <div className="ss-screen">
          <AmbientScene flakeCount={22} />
          <div className="ss-start-inner">
            <h1 className="ss-wordmark">
              ❄️ Snowy Slopes
              <span>Master phonics. Race down the mountain. Reach the summit.</span>
            </h1>
            <Rider />
            <div className="ss-card">
              <h2>Ready to hit the slopes?</h2>
              <button className="ss-btn-primary" onClick={goToModeScreen}>
                Start race 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'mode' && (
        <div className="ss-screen">
          <AmbientScene flakeCount={18} />
          <div className="ss-mode-container">
            <div className="ss-heading-wrap">
              <div className="ss-eyebrow">Choose your slope</div>
              <h1 className="ss-heading">Pick a difficulty</h1>
              <p className="ss-subheading">You can change it any time.</p>
            </div>
            <div className="ss-mode-grid">
              <div className="ss-mode-card beginner">
                <div className="ss-mode-glyph">🟢</div>
                <h3>Beginner</h3>
                <p>Short vowels, basic consonants, CVC words, digraphs, blends and simple long vowels.</p>
                <button className="ss-mode-btn" onClick={() => selectMode('beginner')}>Easy slope</button>
              </div>
              <div className="ss-mode-card intermediate">
                <div className="ss-mode-glyph">🟡</div>
                <h3>Intermediate</h3>
                <p>Vowel teams, r-controlled vowels, diphthongs, silent letters and more complex patterns.</p>
                <button className="ss-mode-btn" onClick={() => selectMode('intermediate')}>Frozen peaks</button>
              </div>
              <div className="ss-mode-card advanced">
                <div className="ss-mode-glyph">🔴</div>
                <h3>Advanced</h3>
                <p>Schwa, complex spelling, irregular patterns, homographs, silent letters and advanced clusters.</p>
                <button className="ss-mode-btn" onClick={() => selectMode('advanced')}>Extreme slope</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'level' && (
        <div className="ss-screen">
          <AmbientScene flakeCount={18} />
          <div className="ss-level-container">
            <div className="ss-heading-wrap">
              <div className="ss-eyebrow">{capitalize(mode)}</div>
              <h1 className="ss-heading">Choose your challenge</h1>
            </div>
            <div className="ss-level-grid">
              <div className="ss-level-card">
                <div className="ss-level-tag">Level 1</div>
                <div className="ss-level-glyph">🔊</div>
                <h3>Learn phonics sounds</h3>
                <p>Match letters and spelling patterns with their sounds.</p>
                <button className="ss-level-btn" onClick={() => startGame(1)}>Start level 1</button>
              </div>
              <div className="ss-level-card">
                <div className="ss-level-tag">Level 2</div>
                <div className="ss-level-glyph">🧩</div>
                <h3>Complete the word</h3>
                <p>Choose the missing sound or spelling pattern to complete each word.</p>
                <button className="ss-level-btn" onClick={() => startGame(2)}>Start level 2</button>
              </div>
              <div className="ss-level-card">
                <div className="ss-level-tag">Level 3</div>
                <div className="ss-level-glyph">✍️</div>
                <h3>Spell the word</h3>
                <p>Listen to the word and type the complete spelling.</p>
                <button className="ss-level-btn" onClick={() => startGame(3)}>Start level 3</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="ss-game-screen">
          <header className="ss-hud">
            <div className="ss-hud-logo">❄️ Snowy Slopes</div>
            <div className="ss-pill hearts">❤️ {lives}</div>
            <div className="ss-pill coins">🪙 {coins}</div>
            <div className="ss-pill xp">⭐ {xp}</div>
            <div className="ss-pill">{questions.length ? `${questionIndex + 1}/${questions.length}` : '0/0'}</div>
            <div className="ss-progress-wrap">
              <div className="ss-progress-label">Summit progress</div>
              <div className="ss-progress-bar">
                <div className="ss-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <button className="ss-exit-btn" onClick={backToLevels}>✕</button>
          </header>

          <div className="ss-game-area">
            <AmbientScene flakeCount={26} />

            <div className="ss-tree" style={{ left: '5%', top: '26%' }}>🌲</div>
            <div className="ss-tree" style={{ right: '8%', top: '38%' }}>🌲</div>
            <div className="ss-tree" style={{ left: '12%', top: '66%' }}>🌲</div>
            <div className="ss-tree" style={{ right: '15%', top: '76%' }}>🌲</div>

            <div
              className={`ss-player ${crash ? 'crash' : ''}`}
              style={{
                ...playerStyle,
                transform: boost ? 'scale(1.15) rotate(-6deg)' : undefined,
              }}
            >
              <Rider />
            </div>

            <div className="ss-question-panel">
              <div className="ss-question-meta">
                <span>{mode.toUpperCase()}</span>
                <span>LEVEL {level}</span>
              </div>
              {renderQuestionBody()}
            </div>
          </div>
        </div>
      )}

      {screen === 'complete' && (
        <div className="ss-screen">
          <AmbientScene flakeCount={18} />
          <div className="ss-card ss-complete-card">
            <div className="ss-complete-glyph">🏆</div>
            <h1>{gameOverFlag ? '❄️ Snowbank crash!' : level === 3 ? '🏆 Summit master!' : '🎿 Slope complete!'}</h1>
            <p>
              {gameOverFlag
                ? "Keep practicing and you'll reach the summit!"
                : level === 3
                ? 'Amazing! You mastered this Snowy Slopes challenge!'
                : 'Great work! Keep climbing toward the summit!'}
            </p>
            <div className="ss-results">
              <div className="ss-result"><strong>{score}</strong><span>Score</span></div>
              <div className="ss-result"><strong>{coins}</strong><span>Coins</span></div>
              <div className="ss-result"><strong>{accuracy}%</strong><span>Accuracy</span></div>
            </div>
            <div className="ss-complete-actions">
              <button className="ss-play-again" onClick={restartGame}>🏂 Play again</button>
              <button className="ss-change-mode" onClick={goToModeScreen}>❄️ Change mode</button>
            </div>
          </div>
        </div>
      )}

      <div className={`ss-feedback ${feedback.type} ${feedback.show ? 'show' : ''}`}>{feedback.text}</div>
    </div>
  );
}
