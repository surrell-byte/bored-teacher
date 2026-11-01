'use client';

import { useEffect, useRef, useState } from 'react';
import { isSoundEnabled } from '@/lib/sound/beep';

const WIDTH = 450;
const HEIGHT = 700;
const BRICK_HEIGHT = 26;
const BRICK_DEPTH_X = 12;
const BRICK_DEPTH_Y = 7.5;
const INITIAL_WIDTH = 190;
const MIN_OVERLAP = 14;
const BONUS_WIDTH = 16;
const MAX_BRICK_WIDTH = 250;
const PERFECT_STREAK = 3;
const COLORS = [
  '#E3000B', '#FFCF00', '#0055BF', '#237841', '#FE8A18', '#BBE90B',
  '#81007B', '#00A3DA', '#FC97AC', '#F4F4F4', '#A0A5A9', '#6C2F1B', '#00A651',
];
const SENTENCES = [
  'I like to read books.',
  'She plays the piano very well.',
  'We went to the park yesterday afternoon.',
  'My brother is learning English at school.',
  'I would like a cup of tea please.',
  'The teacher asked us to finish our homework.',
  'If it rains tomorrow we will stay at home.',
  'Learning a new language takes time and practice.',
  'She said she would call me when she arrived.',
  'The most important thing is to never stop trying.',
];
const SENTENCE_CHALLENGE_ROUNDS = [
  ['I like to read books.', 'My sister enjoys reading story books.'],
  ['The little dog ran across the green field.', 'A puppy chased a ball.'],
  ['We make delicious snacks after school.', 'Friends play fun games together in class.'],
];
const PHONICS_LEVELS = [
  { name: 'Short Sounds', words: [{ word: 'cat', emoji: '🐱', sounds: ['c', 'a', 't'] }, { word: 'dog', emoji: '🐶', sounds: ['d', 'o', 'g'] }, { word: 'sun', emoji: '☀️', sounds: ['s', 'u', 'n'] }] },
  { name: 'Digraphs', words: [{ word: 'ship', emoji: '🚢', sounds: ['sh', 'i', 'p'] }, { word: 'chip', emoji: '🍟', sounds: ['ch', 'i', 'p'] }, { word: 'fish', emoji: '🐟', sounds: ['f', 'i', 'sh'] }] },
  { name: 'Long Vowels', words: [{ word: 'rain', emoji: '🌧️', sounds: ['r', 'ai', 'n'] }, { word: 'boat', emoji: '⛵', sounds: ['b', 'oa', 't'] }, { word: 'tree', emoji: '🌳', sounds: ['t', 'r', 'ee'] }] },
  { name: 'Tricky Sounds', words: [{ word: 'night', emoji: '🌙', sounds: ['n', 'igh', 't'] }, { word: 'three', emoji: '3️⃣', sounds: ['th', 'r', 'ee'] }, { word: 'chair', emoji: '🪑', sounds: ['ch', 'ai', 'r'] }] },
  { name: 'Word Teams', words: [{ word: 'cloud', emoji: '☁️', sounds: ['c', 'l', 'ou', 'd'] }, { word: 'green', emoji: '🟢', sounds: ['g', 'r', 'ee', 'n'] }, { word: 'train', emoji: '🚂', sounds: ['t', 'r', 'ai', 'n'] }] },
];

function readBest(key) {
  try {
    return Number.parseInt(window.localStorage.getItem(key) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function shade(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return `rgb(${channels.map(channel => Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount))).join(',')})`;
}

function labelColor(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  const luminance = (0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255;
  return luminance > 0.55 ? 'rgba(18,20,28,.9)' : 'rgba(255,255,255,.96)';
}

function initialName(profileName) {
  const name = profileName?.trim();
  if (name) return name.slice(0, 16);
  try {
    return window.localStorage.getItem('lt_name') || '';
  } catch {
    return '';
  }
}

export default function LanguageTower({ onComplete, onHudUpdate, profileName }) {
  const canvasRef = useRef(null);
  const nameInputRef = useRef(null);
  const timerBarRef = useRef(null);
  const actionsRef = useRef({});
  const onCompleteRef = useRef(onComplete);
  const onHudUpdateRef = useRef(onHudUpdate);

  const [playerName, setPlayerName] = useState(() => initialName(profileName));
  const playerNameRef = useRef(playerName);
  const profileNameRef = useRef(profileName);
  playerNameRef.current = playerName;
  profileNameRef.current = profileName;
  const [screen, setScreen] = useState(() => initialName(profileName) ? 'menu' : 'info');
  const [screenData, setScreenData] = useState({});
  const [challengeNames, setChallengeNames] = useState({ playerOne: '', playerTwo: '' });
  const [challengeView, setChallengeView] = useState(null);
  const [hud, setHud] = useState({ score: '0', subtitle: 'BEST 0', size: 44 });
  const [hudVisible, setHudVisible] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [rainWarning, setRainWarning] = useState(false);
  onCompleteRef.current = onComplete;
  onHudUpdateRef.current = onHudUpdate;
  const [bestScores, setBestScores] = useState(() => ({
    normal: readBest('lt_best_normal'),
    esl: readBest('lt_best_esl'),
    phonics: readBest('lt_best_phonics'),
    rain: readBest('lt_best_rain'),
  }));
  const gameRef = useRef({
    bricks: [],
    moving: null,
    falling: [],
    sparks: [],
    floaters: [],
    rainDrops: [],
    colorBag: [],
    lastColor: null,
    camY: HEIGHT * 0.85,
    camTarget: HEIGHT * 0.85,
    score: 0,
    combo: 0,
    state: 'menu',
    paused: false,
    mode: 'normal',
    timeLeft: 0,
    timeMax: 6,
    shake: 0,
    rainOn: false,
    eroding: false,
    eslLevel: 0,
    eslWords: [],
    eslPlaced: 0,
    phonicsLevel: 0,
    phonicsWord: 0,
    phonicsSound: 0,
    bestNormal: readBest('lt_best_normal'),
    bestESL: readBest('lt_best_esl'),
    bestPhonics: readBest('lt_best_phonics'),
    bestRain: readBest('lt_best_rain'),
    audio: null,
    overTimer: null,
    attempts: 0,
    perfects: 0,
    completionReported: false,
    challenge: null,
  });

  useEffect(() => {
    if (screen === 'info') nameInputRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    if (profileName?.trim()) setPlayerName(current => current || profileName.trim().slice(0, 16));
  }, [profileName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setScreen('canvas-error');
      return undefined;
    }

    const game = gameRef.current;
    let frameId = 0;
    let previousTime = performance.now();
    let isDisposed = false;
    let challengeTransitionAt = 0;

    function fitCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(WIDTH * ratio);
      canvas.height = Math.round(HEIGHT * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function nextColor() {
      if (!game.colorBag.length) {
        game.colorBag = [...COLORS];
        for (let index = game.colorBag.length - 1; index > 0; index -= 1) {
          const next = Math.floor(Math.random() * (index + 1));
          [game.colorBag[index], game.colorBag[next]] = [game.colorBag[next], game.colorBag[index]];
        }
        if (game.colorBag.length > 1 && game.colorBag.at(-1) === game.lastColor) {
          [game.colorBag[game.colorBag.length - 1], game.colorBag[0]] = [game.colorBag[0], game.colorBag[game.colorBag.length - 1]];
        }
      }
      game.lastColor = game.colorBag.pop();
      return game.lastColor;
    }

    function playTone(frequency, duration, type = 'sine', volume = 0.07, delay = 0) {
      if (!isSoundEnabled() || !game.audio) return;
      const time = game.audio.currentTime + delay;
      const oscillator = game.audio.createOscillator();
      const gain = game.audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(game.audio.destination);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.03);
    }

    function initAudio() {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!game.audio && AudioContextConstructor) {
        try {
          game.audio = new AudioContextConstructor();
        } catch (error) {
          console.error('Language Tower could not initialize audio.', error);
        }
      }
      if (game.audio?.state === 'suspended') {
        void game.audio.resume().catch(error => console.error('Language Tower could not resume audio.', error));
      }
    }

    function currentPhonicsWord() {
      return PHONICS_LEVELS[game.phonicsLevel]?.words[game.phonicsWord] || null;
    }

    function updateHud() {
      if (game.mode === 'normal' || game.mode === 'rain') {
        setHud({ score: String(game.score), subtitle: `BEST ${game.mode === 'rain' ? game.bestRain : game.bestNormal}`, size: 44 });
      } else if (game.mode === 'esl') {
        setHud({ score: `${game.eslPlaced}/${game.eslWords.length}`, subtitle: `LEVEL ${game.eslLevel + 1}`, size: 34 });
      } else {
        const level = PHONICS_LEVELS[game.phonicsLevel];
        const total = level.words.reduce((sum, word) => sum + word.sounds.length, 0);
        const done = level.words.slice(0, game.phonicsWord).reduce((sum, word) => sum + word.sounds.length, 0) + game.phonicsSound;
        setHud({ score: `${done}/${total}`, subtitle: `LEVEL ${game.phonicsLevel + 1}`, size: 34 });
      }
    }

    function updatePrompt() {
      if (game.mode === 'esl' && game.eslWords.length) {
        setPrompt({ mode: 'esl', words: game.eslWords, placed: game.eslPlaced });
      } else if (game.mode === 'phonics') {
        const word = currentPhonicsWord();
        if (word) {
          setPrompt({
            mode: 'phonics',
            word,
            level: PHONICS_LEVELS[game.phonicsLevel],
            wordIndex: game.phonicsWord,
            soundIndex: game.phonicsSound,
          });
        } else {
          setPrompt(null);
        }
      } else {
        setPrompt(null);
      }
    }

    function syncTimer() {
      const bar = timerBarRef.current;
      if (!bar) return;
      const fraction = Math.max(0, Math.min(1, game.timeLeft / game.timeMax));
      bar.style.width = `${Math.round(fraction * 100)}%`;
      bar.style.background = fraction > 0.5
        ? 'linear-gradient(90deg,#00E676,#7CFF9B)'
        : fraction > 0.25
          ? 'linear-gradient(90deg,#FFCF00,#FFE97A)'
          : 'linear-gradient(90deg,#FF3B30,#FF7A6E)';
    }

    function newRainDrop(anywhere) {
      return {
        x: Math.random() * (WIDTH + 120) - 60,
        y: anywhere ? Math.random() * (HEIGHT + 60) - 60 : -40 - Math.random() * 120,
        length: 12 + Math.random() * 22,
        speed: 520 + Math.random() * 560,
        alpha: 0.06 + Math.random() * 0.2,
        width: 0.8 + Math.random() * 0.9,
      };
    }

    function initRain() {
      game.rainDrops = Array.from({ length: 105 }, () => newRainDrop(true));
    }

    function resetTower() {
      clearTimeout(game.overTimer);
      game.bricks = [{ x: (WIDTH - INITIAL_WIDTH) / 2, w: INITIAL_WIDTH, y: 0, color: nextColor(), label: null }];
      game.camY = game.camTarget = HEIGHT * 0.85;
      game.falling = [];
      game.sparks = [];
      game.floaters = [];
      game.shake = 0;
      game.combo = 0;
      game.moving = null;
      game.eroding = false;
      setRainWarning(false);
      spawnMoving(false);
    }

    function nextLabel() {
      if (game.mode === 'esl') return game.eslWords[game.eslPlaced] || null;
      if (game.mode === 'phonics') return currentPhonicsWord()?.sounds[game.phonicsSound] || null;
      return null;
    }

    function spawnMoving(bonus) {
      const top = game.bricks[game.bricks.length - 1];
      let width = top.w;
      let gotBonus = false;
      if (bonus) {
        const expanded = Math.min(top.w + BONUS_WIDTH, MAX_BRICK_WIDTH);
        if (expanded > width + 0.5) {
          width = expanded;
          gotBonus = true;
        }
      }
      const minX = -width * 0.55;
      const maxX = WIDTH - width * 0.45;
      game.moving = {
        w: width,
        baseW: width,
        bonus: gotBonus,
        y: top.y - BRICK_HEIGHT,
        x: minX + (maxX - minX) * (0.1 + Math.random() * 0.8),
        dir: Math.random() < 0.5 ? -1 : 1,
        speed: Math.min(150 + game.bricks.length * 8, 520),
        minX,
        maxX,
        color: nextColor(),
        label: nextLabel(),
      };
      if (gotBonus) {
        game.floaters.push({ x: WIDTH / 2, y: game.moving.y + game.camY - 34, text: '+ WIDTH BONUS', life: 1.25, color: '#7CFF9B', size: 18 });
        [784, 988, 1319].forEach((frequency, index) => playTone(frequency, 0.14, 'sine', 0.07, index * 0.06));
      }
    }

    function buildDemo() {
      game.bricks = [];
      let x = (WIDTH - INITIAL_WIDTH) / 2;
      let width = INITIAL_WIDTH;
      for (let index = 0; index < 6; index += 1) {
        game.bricks.push({ x, w: width, y: -index * BRICK_HEIGHT, color: nextColor(), label: null });
        const nextWidth = width * (0.84 + Math.random() * 0.16);
        x += (width - nextWidth) / 2 + (Math.random() - 0.5) * 10;
        width = nextWidth;
      }
      game.camY = game.camTarget = HEIGHT * 0.85;
      game.moving = null;
      game.falling = [];
      game.sparks = [];
      game.floaters = [];
    }

    function startGame(mode, level = 0) {
      game.challenge = null;
      setChallengeView(null);
      onHudUpdateRef.current?.(null);
      game.mode = mode;
      game.score = 0;
      game.paused = false;
      game.attempts = 0;
      game.perfects = 0;
      game.completionReported = false;
      game.rainOn = mode === 'rain';
      game.timeMax = mode === 'rain' ? 7 : mode === 'esl' ? Math.max(3.2, 7 - level * 0.35) : mode === 'phonics' ? Math.max(3.5, 6.5 - level * 0.5) : 6;

      if (mode === 'esl') {
        game.eslLevel = Math.min(level, SENTENCES.length - 1);
        game.eslWords = SENTENCES[game.eslLevel].split(' ');
        game.eslPlaced = 0;
      } else if (mode === 'phonics') {
        game.phonicsLevel = Math.min(level, PHONICS_LEVELS.length - 1);
        game.phonicsWord = 0;
        game.phonicsSound = 0;
      } else {
        game.eslWords = [];
        game.eslPlaced = 0;
      }

      resetTower();
      game.timeLeft = game.timeMax;
      game.state = 'playing';
      if (mode === 'rain') initRain();
      setHudVisible(true);
      setRainWarning(false);
      setScreen(null);
      updatePrompt();
      updateHud();
      syncTimer();
      initAudio();
    }

    function saveBests() {
      const scores = {
        normal: game.bestNormal,
        esl: game.bestESL,
        phonics: game.bestPhonics,
        rain: game.bestRain,
      };
      try {
        window.localStorage.setItem('lt_best_normal', String(scores.normal));
        window.localStorage.setItem('lt_best_esl', String(scores.esl));
        window.localStorage.setItem('lt_best_phonics', String(scores.phonics));
        window.localStorage.setItem('lt_best_rain', String(scores.rain));
      } catch (error) {
        console.error('Language Tower could not save its best scores.', error);
      }
      setBestScores(scores);
    }

    function reportResult() {
      if (game.completionReported) return;
      game.completionReported = true;
      const accuracy = game.attempts ? Math.round((game.perfects / game.attempts) * 100) : 0;
      onCompleteRef.current?.(game.score, accuracy);
    }

    function endGame(reason) {
      if (game.state !== 'playing') return;
      game.state = 'over';
      game.combo = 0;
      game.eroding = false;
      setRainWarning(false);
      const modeBest = game.mode === 'rain' ? 'bestRain' : 'bestNormal';
      const isNewBest = (game.mode === 'normal' || game.mode === 'rain') && game.score > game[modeBest];
      if (isNewBest) {
        game[modeBest] = game.score;
        saveBests();
      }
      if (game.mode === 'esl') {
        game.bestESL = Math.max(game.bestESL, game.eslLevel + 1);
        saveBests();
      } else if (game.mode === 'phonics') {
        game.bestPhonics = Math.max(game.bestPhonics, game.phonicsLevel + 1);
        saveBests();
      }
      updateHud();
      reportResult();
      playTone(180, 0.45, 'sawtooth', 0.08);
      clearTimeout(game.overTimer);
      game.overTimer = setTimeout(() => {
        if (game.state !== 'over') return;
        setScreenData({ reason, isNewBest });
        setScreen(game.mode === 'normal' || game.mode === 'rain' ? 'gameover' : 'levelfailed');
      }, 750);
    }

    function levelComplete() {
      game.state = 'over';
      game.combo = 0;
      if (game.mode === 'esl') {
        game.bestESL = Math.max(game.bestESL, game.eslLevel + 1);
      } else {
        game.bestPhonics = Math.max(game.bestPhonics, game.phonicsLevel + 1);
      }
      saveBests();
      reportResult();
      [523, 659, 784, 1046].forEach((frequency, index) => playTone(frequency, 0.18, 'sine', 0.075, index * 0.09));
      clearTimeout(game.overTimer);
      game.overTimer = setTimeout(() => {
        if (game.state === 'over') setScreen('levelcomplete');
      }, 700);
    }

    function publishChallengeHud(challenge) {
      if (!challenge) {
        setChallengeView(null);
        onHudUpdateRef.current?.(null);
        return;
      }

      const currentPlayer = challenge.players[challenge.currentPlayer];
      const summary = {
        round: challenge.round,
        rounds: SENTENCE_CHALLENGE_ROUNDS.length,
        phase: challenge.phase,
        playerOne: { name: challenge.players[0].name, score: challenge.players[0].score },
        playerTwo: { name: challenge.players[1].name, score: challenge.players[1].score },
        turn: currentPlayer.isAI ? 'AI' : currentPlayer.name,
        againstAI: challenge.againstAI,
      };
      setChallengeView(summary);
      onHudUpdateRef.current?.(summary);
    }

    function prepareChallengeRound(challenge, round) {
      challenge.round = round;
      challenge.phase = 'playing';
      challenge.currentPlayer = 0;
      challenge.reveal = null;
      challenge.feedback = '';
      challenge.roundSentences = SENTENCE_CHALLENGE_ROUNDS[round - 1].map(sentence => sentence.split(/\s+/));
      challenge.players.forEach((player, index) => {
        player.words = challenge.roundSentences[index];
        player.blockOrder = player.words.map((_, wordIndex) => wordIndex);
        for (let position = player.blockOrder.length - 1; position > 0; position -= 1) {
          const swapPosition = Math.floor(Math.random() * (position + 1));
          [player.blockOrder[position], player.blockOrder[swapPosition]] = [player.blockOrder[swapPosition], player.blockOrder[position]];
        }
        player.wordIndex = 0;
        player.tried = new Set();
        player.roundFound = 0;
        player.roundPoints = 0;
      });
      setScreen('challenge-playing');
      publishChallengeHud(challenge);
    }

    function finishChallengeRound(challenge) {
      if (challenge.phase === 'round-complete' || challenge.phase === 'victory') return;
      const [playerOne, playerTwo] = challenge.players;
      const winner = playerOne.roundFound === playerTwo.roundFound
        ? null
        : playerOne.roundFound > playerTwo.roundFound ? 0 : 1;
      if (winner !== null) {
        challenge.players[winner].score += 25;
        challenge.players[winner].roundPoints += 25;
      }
      challenge.roundWinners[challenge.round - 1] = winner;
      challenge.phase = 'round-complete';
      challenge.roundWinner = winner;
      challenge.feedback = winner === null
        ? 'Round tied — no word bonus this time.'
        : `${challenge.players[winner].name} found more words and earns 25 bonus points!`;
      publishChallengeHud(challenge);
    }

    function startSentenceChallenge(nameOne, nameTwo) {
      const playerOne = nameOne.trim().slice(0, 16) || 'Player 1';
      const playerTwo = nameTwo.trim().slice(0, 16);
      const againstAI = !playerTwo;
      const challenge = {
        round: 1,
        phase: 'playing',
        currentPlayer: 0,
        againstAI,
        feedback: '',
        reveal: null,
        players: [
          { name: playerOne, isAI: false, score: 0, wordsFound: 0, streak: 0, streaks: 0, longestStreak: 0, words: [], wordIndex: 0, tried: new Set(), roundFound: 0, roundPoints: 0, roundScores: [], roundWins: 0 },
          { name: playerTwo || 'AI Challenger', isAI: againstAI, score: 0, wordsFound: 0, streak: 0, streaks: 0, longestStreak: 0, words: [], wordIndex: 0, tried: new Set(), roundFound: 0, roundPoints: 0, roundScores: [], roundWins: 0 },
        ],
        roundSentences: [],
        roundWinners: [],
      };
      game.challenge = challenge;
      game.state = 'challenge';
      game.paused = false;
      game.rainOn = false;
      game.score = 0;
      game.completionReported = false;
      setHudVisible(false);
      setRainWarning(false);
      prepareChallengeRound(challenge, 1);
    }

    function nextChallengeTurn(challenge) {
      if (challenge.players.every(player => player.wordIndex >= player.words.length)) {
        finishChallengeRound(challenge);
        return;
      }

      let nextPlayer = challenge.currentPlayer === 0 ? 1 : 0;
      if (challenge.players[nextPlayer].wordIndex >= challenge.players[nextPlayer].words.length) {
        nextPlayer = challenge.currentPlayer;
      }
      challenge.currentPlayer = nextPlayer;
      challenge.reveal = null;
      challenge.feedback = '';
      const next = challenge.players[nextPlayer];
      challenge.phase = next.isAI ? 'ai-thinking' : 'playing';
      challengeTransitionAt = next.isAI ? performance.now() + 850 : 0;
      publishChallengeHud(challenge);
    }

    function chooseChallengeBlock(blockIndex, isAI = false) {
      const challenge = game.challenge;
      if (!challenge || challenge.phase !== (isAI ? 'ai-thinking' : 'playing')) return;
      const player = challenge.players[challenge.currentPlayer];
      if (player.isAI !== isAI || player.wordIndex >= player.words.length || player.tried.has(blockIndex)) return;

      const target = player.wordIndex;
      if (blockIndex === target) {
        player.wordIndex += 1;
        player.wordsFound += 1;
        player.roundFound += 1;
        player.streak += 1;
        if (player.streak === 2) player.streaks += 1;
        player.longestStreak = Math.max(player.longestStreak, player.streak);
        const streakBonus = Math.min(player.streak, 10) * 5;
        const points = 10 + streakBonus;
        player.score += points;
        player.roundPoints += points;
        player.tried = new Set();
        challenge.reveal = { playerIndex: challenge.currentPlayer, blockIndex, word: player.words[target] };
        challenge.feedback = `${player.name} found “${player.words[target].replace(/[.,!?;:]$/, '')}” · +${points} points`;
        challenge.phase = 'reveal';
        challengeTransitionAt = performance.now() + 3000;
        playTone(740 + Math.min(player.streak, 8) * 50, 0.12, 'sine', 0.07);
      } else {
        player.tried.add(blockIndex);
        player.streak = 0;
        challenge.feedback = `${player.name} picked the wrong block. The next player is up!`;
        challenge.phase = 'feedback';
        challengeTransitionAt = performance.now() + 700;
        playTone(220, 0.1, 'triangle', 0.05);
      }
      publishChallengeHud(challenge);
    }

    function takeAITurn() {
      const challenge = game.challenge;
      if (!challenge || challenge.phase !== 'ai-thinking') return;
      const player = challenge.players[challenge.currentPlayer];
      const available = player.words.map((_, index) => index).filter(index => index >= player.wordIndex && !player.tried.has(index));
      const target = player.wordIndex;
      const distractors = available.filter(index => index !== target);
      const findWord = distractors.length === 0 || Math.random() < 0.62 + challenge.round * 0.04;
      const choice = findWord ? target : distractors[Math.floor(Math.random() * distractors.length)];
      chooseChallengeBlock(choice, true);
    }

    function continueChallenge() {
      const challenge = game.challenge;
      if (!challenge || challenge.phase !== 'round-complete') return;
      challenge.players.forEach(player => {
        player.roundScores[challenge.round - 1] = player.roundPoints;
        if (challenge.roundWinners[challenge.round - 1] === challenge.players.indexOf(player)) player.roundWins += 1;
      });
      if (challenge.round < SENTENCE_CHALLENGE_ROUNDS.length) {
        prepareChallengeRound(challenge, challenge.round + 1);
        return;
      }

      challenge.phase = 'victory';
      game.state = 'complete';
      const playerOne = challenge.players[0];
      const totalWords = SENTENCE_CHALLENGE_ROUNDS.reduce((sum, round) => sum + round[0].split(/\s+/).length, 0);
      const accuracy = Math.round(playerOne.wordsFound / totalWords * 100);
      if (!game.completionReported) {
        game.completionReported = true;
        onCompleteRef.current?.(playerOne.score, accuracy);
      }
      challenge.players.forEach((player, index) => {
        player.totalWordsAvailable = SENTENCE_CHALLENGE_ROUNDS.reduce((sum, round) => sum + round[index].split(/\s+/).length, 0);
        const highestRoundScore = Math.max(...player.roundScores);
        player.bestRound = player.roundScores.findIndex(score => score === highestRoundScore) + 1;
      });
      setScreen('challenge-victory');
      publishChallengeHud(challenge);
    }

    function openChallengeSetup() {
      setChallengeNames({
        playerOne: (profileNameRef.current?.trim() || playerNameRef.current.trim() || 'Player 1').slice(0, 16),
        playerTwo: '',
      });
      setScreen('challenge-info');
    }

    function burstSparks(x, y, color) {
      for (let index = 0; index < 16; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 90 + Math.random() * 200;
        game.sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 90,
          life: 0.5 + Math.random() * 0.35,
          maxLife: 0.85,
          radius: 1.5 + Math.random() * 2.5,
          color: Math.random() < 0.5 ? color : '#FFCF00',
        });
      }
    }

    function dropBrick() {
      if (game.state !== 'playing' || !game.moving) return;
      const moving = game.moving;
      const top = game.bricks[game.bricks.length - 1];
      const centerDifference = moving.x + moving.w / 2 - (top.x + top.w / 2);
      const overlapLeft = Math.max(top.x, moving.x);
      const overlapRight = Math.min(top.x + top.w, moving.x + moving.w);
      const overlap = overlapRight - overlapLeft;
      game.attempts += 1;

      if (overlap <= 4 || overlap < MIN_OVERLAP) {
        game.falling.push({
          x: moving.x, y: moving.y, w: moving.w, color: moving.color, label: moving.label,
          vx: (centerDifference > 0 ? 1 : -1) * (overlap <= 4 ? 150 : 100),
          vy: overlap <= 4 ? -120 : -60,
          rot: 0,
          vr: (centerDifference > 0 ? 1 : -1) * (overlap <= 4 ? 3.2 : 2.6),
        });
        game.moving = null;
        playTone(overlap <= 4 ? 150 : 180, 0.35, 'sawtooth', 0.09);
        endGame(overlap <= 4 ? 'miss' : 'collapse');
        return;
      }

      const tolerance = Math.max(3, Math.min(6, Math.min(top.w, moving.w) * 0.08));
      const perfect = Math.abs(centerDifference) < tolerance;
      let bonusNext = false;
      if (perfect) {
        game.combo += 1;
        game.perfects += 1;
        game.score += 10 + game.combo * 5;
        const width = moving.w;
        const x = top.x + (top.w - width) / 2;
        game.bricks.push({ x, w: width, y: top.y - BRICK_HEIGHT, color: moving.color, label: moving.label });
        burstSparks(x + width / 2, top.y - BRICK_HEIGHT + game.camY, moving.color);
        game.floaters.push({ x: x + width / 2, y: top.y - BRICK_HEIGHT + game.camY - 26, text: game.combo > 1 ? `PERFECT ×${game.combo}` : 'PERFECT', life: 1, color: '#FFCF00', size: 20 });
        if (game.combo % PERFECT_STREAK === 0) {
          bonusNext = true;
          game.floaters.push({ x: x + width / 2, y: top.y - BRICK_HEIGHT + game.camY - 52, text: 'STREAK BONUS!', life: 1.3, color: '#7CFF9B', size: 16 });
        }
        game.shake = Math.min(1, 0.22 + game.combo * 0.05);
        playTone(660 + Math.min(game.combo, 8) * 60, 0.09, 'sine', 0.09);
        playTone(990 + Math.min(game.combo, 8) * 80, 0.12, 'sine', 0.06, 0.045);
      } else {
        game.combo = 0;
        game.score += 1;
        const leftCut = Math.max(0, top.x - moving.x);
        const rightCut = Math.max(0, moving.x + moving.w - (top.x + top.w));
        if (leftCut > 0.5) game.falling.push({ x: moving.x, y: moving.y, w: leftCut, color: moving.color, label: null, vx: -160, vy: -90, rot: 0, vr: -3.4 });
        if (rightCut > 0.5) game.falling.push({ x: top.x + top.w, y: moving.y, w: rightCut, color: moving.color, label: null, vx: 160, vy: -90, rot: 0, vr: 3.4 });
        game.bricks.push({ x: overlapLeft, w: overlap, y: top.y - BRICK_HEIGHT, color: moving.color, label: moving.label });
        playTone(330, 0.06, 'square', 0.05);
      }

      if (game.mode === 'esl') {
        game.eslPlaced += 1;
        if (game.eslPlaced >= game.eslWords.length) {
          game.moving = null;
          updatePrompt();
          updateHud();
          levelComplete();
          return;
        }
      } else if (game.mode === 'phonics') {
        const word = currentPhonicsWord();
        game.phonicsSound += 1;
        if (game.phonicsSound >= word.sounds.length) {
          game.phonicsSound = 0;
          game.phonicsWord += 1;
          if (game.phonicsWord >= PHONICS_LEVELS[game.phonicsLevel].words.length) {
            game.moving = null;
            updatePrompt();
            updateHud();
            levelComplete();
            return;
          }
        }
      }

      game.eroding = false;
      setRainWarning(false);
      spawnMoving(bonusNext);
      game.timeLeft = game.timeMax;
      syncTimer();
      updatePrompt();
      updateHud();
    }

    function toMenu() {
      clearTimeout(game.overTimer);
      game.state = 'menu';
      game.challenge = null;
      game.paused = false;
      game.rainOn = false;
      game.eroding = false;
      setRainWarning(false);
      setHudVisible(false);
      setChallengeView(null);
      onHudUpdateRef.current?.(null);
      buildDemo();
      setScreen('menu');
    }

    actionsRef.current = {
      startNormal: () => startGame('normal'),
      startRain: () => startGame('rain'),
      startESL: level => startGame('esl', level),
      startPhonics: level => startGame('phonics', level),
      openChallengeSetup,
      startSentenceChallenge: (nameOne, nameTwo) => startSentenceChallenge(nameOne, nameTwo),
      chooseChallengeBlock,
      continueChallenge,
      retry: () => startGame(game.mode, game.mode === 'esl' ? game.eslLevel : game.phonicsLevel),
      next: () => startGame(game.mode, game.mode === 'esl' ? game.eslLevel + 1 : game.phonicsLevel + 1),
      playAgain: () => startGame(game.mode === 'rain' ? 'rain' : 'normal'),
      drop: dropBrick,
      startAudio: initAudio,
      toMenu,
      saveName: name => {
        const nextName = name.trim().slice(0, 16) || 'Player';
        setPlayerName(nextName);
        try {
          window.localStorage.setItem('lt_name', nextName);
        } catch (error) {
          console.error('Language Tower could not save the player name.', error);
        }
        setScreen('menu');
      },
    };

    function updateRain(delta) {
      for (const drop of game.rainDrops) {
        drop.y += drop.speed * delta;
        drop.x -= drop.speed * 0.16 * delta;
        if (drop.y > HEIGHT + 50 || drop.x < -70) Object.assign(drop, newRainDrop(false));
      }
    }

    function updateChallenge(now) {
      const challenge = game.challenge;
      if (!challenge) return;
      if (challenge.phase === 'ai-thinking' && now >= challengeTransitionAt) {
        takeAITurn();
      } else if ((challenge.phase === 'reveal' || challenge.phase === 'feedback') && now >= challengeTransitionAt) {
        nextChallengeTurn(challenge);
      }
    }

    function update(delta, now) {
      if (game.paused) return;
      if (game.state === 'challenge') {
        updateChallenge(now);
        return;
      }
      const topIndex = game.bricks.length - 1;
      game.camTarget = Math.max(HEIGHT * 0.85, HEIGHT * 0.58 + topIndex * BRICK_HEIGHT);
      game.camY += (game.camTarget - game.camY) * Math.min(1, delta * 7);
      if (game.rainOn) updateRain(delta);

      if (game.state === 'playing') {
        game.timeLeft -= delta;
        if (game.timeLeft <= 0) {
          game.timeLeft = 0;
          syncTimer();
          endGame('time');
        } else {
          syncTimer();
        }
      }

      if (game.mode === 'rain' && game.state === 'playing' && game.moving) {
        const halfway = game.timeMax * 0.5;
        if (game.timeLeft < halfway) {
          if (!game.eroding) {
            game.eroding = true;
            setRainWarning(true);
            playTone(420, 0.12, 'triangle', 0.05);
          }
          const depth = (halfway - game.timeLeft) / halfway;
          const rate = 42 + depth * 145;
          const minimumWidth = Math.max(MIN_OVERLAP + 6, game.moving.baseW * 0.28);
          if (game.moving.w > minimumWidth) {
            const shrink = Math.min(game.moving.w - minimumWidth, rate * delta);
            game.moving.w -= shrink;
            game.moving.x += shrink / 2;
            game.moving.minX = -game.moving.w * 0.55;
            game.moving.maxX = WIDTH - game.moving.w * 0.45;
            if (Math.random() < 0.7) {
              const edge = Math.random() < 0.5 ? game.moving.x : game.moving.x + game.moving.w;
              game.sparks.push({ x: edge, y: game.moving.y + game.camY + Math.random() * BRICK_HEIGHT, vx: (Math.random() - 0.5) * 50, vy: 70 + Math.random() * 120, life: 0.5, maxLife: 0.65, radius: 2, color: '#9FD3FF' });
            }
          }
        } else if (game.eroding) {
          game.eroding = false;
          setRainWarning(false);
        }
      }

      if (game.moving && game.state === 'playing') {
        game.moving.x += game.moving.dir * game.moving.speed * delta;
        if (game.moving.x <= game.moving.minX) {
          game.moving.x = game.moving.minX;
          game.moving.dir = 1;
        }
        if (game.moving.x >= game.moving.maxX) {
          game.moving.x = game.moving.maxX;
          game.moving.dir = -1;
        }
      }

      for (let index = game.falling.length - 1; index >= 0; index -= 1) {
        const piece = game.falling[index];
        piece.vy += 1500 * delta;
        piece.x += piece.vx * delta;
        piece.y += piece.vy * delta;
        piece.rot += piece.vr * delta;
        if (piece.y + game.camY > HEIGHT + 240) game.falling.splice(index, 1);
      }
      for (let index = game.sparks.length - 1; index >= 0; index -= 1) {
        const spark = game.sparks[index];
        spark.vy += 850 * delta;
        spark.x += spark.vx * delta;
        spark.y += spark.vy * delta;
        spark.life -= delta;
        if (spark.life <= 0) game.sparks.splice(index, 1);
      }
      for (let index = game.floaters.length - 1; index >= 0; index -= 1) {
        const floater = game.floaters[index];
        floater.y -= 46 * delta;
        floater.life -= delta * 1.15;
        if (floater.life <= 0) game.floaters.splice(index, 1);
      }
      if (game.shake > 0) game.shake = Math.max(0, game.shake - delta * 3.2);
    }

    function drawRain() {
      ctx.save();
      ctx.lineCap = 'round';
      for (const drop of game.rainDrops) {
        ctx.strokeStyle = `rgba(170,215,255,${drop.alpha})`;
        ctx.lineWidth = drop.width;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.length * 0.18, drop.y + drop.length);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, game.rainOn ? '#040a14' : '#081120');
      gradient.addColorStop(0.55, game.rainOn ? '#0e1f38' : '#14284a');
      gradient.addColorStop(1, game.rainOn ? '#173350' : '#1e3d63');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const glow = ctx.createRadialGradient(WIDTH * 0.5, HEIGHT * 0.18, 0, WIDTH * 0.5, HEIGHT * 0.18, WIDTH * 0.95);
      glow.addColorStop(0, 'rgba(90,160,255,.13)');
      glow.addColorStop(1, 'rgba(90,160,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = 'rgba(190,220,255,.16)';
      const span = HEIGHT + 200;
      for (let index = 0; index < 46; index += 1) {
        const seed = index * 127.31;
        const x = ((Math.sin(seed) * 0.5 + 0.5) * WIDTH + WIDTH) % WIDTH;
        const baseY = (Math.cos(seed * 1.7) * 0.5 + 0.5) * span;
        const y = ((baseY + game.camY * 0.18) % span) - 100;
        ctx.beginPath();
        ctx.arc(x, y, 1 + (index % 3) * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (game.rainOn) drawRain();
    }

    function drawBrick(x, y, width, height, color, label, wet = false) {
      if (width <= 0.5) return;
      ctx.beginPath();
      ctx.moveTo(x + width, y);
      ctx.lineTo(x + width + BRICK_DEPTH_X, y - BRICK_DEPTH_Y);
      ctx.lineTo(x + width + BRICK_DEPTH_X, y - BRICK_DEPTH_Y + height);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fillStyle = shade(color, -0.32);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width + BRICK_DEPTH_X, y - BRICK_DEPTH_Y);
      ctx.lineTo(x + BRICK_DEPTH_X, y - BRICK_DEPTH_Y);
      ctx.closePath();
      ctx.fillStyle = shade(color, 0.32);
      ctx.fill();

      const studCount = Math.max(1, Math.round(width / 34));
      for (let index = 0; index < studCount; index += 1) {
        const studX = x + (0.5 / studCount + index / studCount) * width + BRICK_DEPTH_X / 2;
        const studY = y - BRICK_DEPTH_Y / 2;
        const radiusX = Math.min(5.5, (width / studCount) * 0.3);
        ctx.beginPath();
        ctx.ellipse(studX, studY, radiusX, radiusX * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = shade(color, 0.55);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = shade(color, 0.15);
        ctx.stroke();
      }

      const face = ctx.createLinearGradient(0, y, 0, y + height);
      face.addColorStop(0, shade(color, 0.14));
      face.addColorStop(1, shade(color, -0.07));
      ctx.fillStyle = face;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.fillRect(x, y, width, 1.5);
      if (wet) {
        ctx.fillStyle = 'rgba(150,210,255,.16)';
        ctx.fillRect(x, y, width, height);
      }
      if (!label || width < 18) return;

      const maxWidth = width - 6;
      let fontSize = 14;
      ctx.font = `800 ${fontSize}px system-ui,sans-serif`;
      const labelWidth = ctx.measureText(label).width;
      if (labelWidth > maxWidth) {
        fontSize *= maxWidth / labelWidth;
        if (fontSize < 6.5) return;
        ctx.font = `800 ${fontSize}px system-ui,sans-serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.fillText(label, x + width / 2, y + height / 2 + 1.6);
      ctx.fillStyle = labelColor(color);
      ctx.fillText(label, x + width / 2, y + height / 2);
    }

    function draw() {
      ctx.save();
      if (game.shake > 0) {
        const magnitude = game.shake * 7;
        ctx.translate((Math.random() - 0.5) * magnitude, (Math.random() - 0.5) * magnitude);
      }
      drawBackground();
      for (const brick of game.bricks) drawBrick(brick.x, brick.y + game.camY, brick.w, BRICK_HEIGHT, brick.color, brick.label);
      for (const piece of game.falling) {
        ctx.save();
        ctx.translate(piece.x + piece.w / 2, piece.y + game.camY + BRICK_HEIGHT / 2);
        ctx.rotate(piece.rot);
        drawBrick(-piece.w / 2, -BRICK_HEIGHT / 2, piece.w, BRICK_HEIGHT, piece.color, piece.label);
        ctx.restore();
      }
      if (game.moving) {
        const moving = game.moving;
        const drawMovingBrick = () => drawBrick(moving.x, moving.y + game.camY - 7, moving.w, BRICK_HEIGHT, moving.color, moving.label, game.eroding);
        if (moving.bonus) {
          ctx.save();
          ctx.shadowColor = 'rgba(124,255,155,.95)';
          ctx.shadowBlur = 18;
          drawMovingBrick();
          ctx.restore();
          ctx.font = '800 10px system-ui,sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#7CFF9B';
          ctx.fillText('＋LONG', moving.x + moving.w / 2, moving.y + game.camY - 20);
        } else {
          drawMovingBrick();
        }
      }
      for (const spark of game.sparks) {
        ctx.globalAlpha = Math.max(0, Math.min(1, spark.life / spark.maxLife));
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const floater of game.floaters) {
        ctx.globalAlpha = Math.max(0, Math.min(1, floater.life));
        ctx.font = `800 ${floater.size || 22}px system-ui,sans-serif`;
        ctx.fillStyle = 'rgba(0,0,0,.35)';
        ctx.fillText(floater.text, floater.x, floater.y + 2);
        ctx.fillStyle = floater.color;
        ctx.fillText(floater.text, floater.x, floater.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function loop(now) {
      if (isDisposed) return;
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      update(delta, now);
      draw();
      frameId = window.requestAnimationFrame(loop);
    }

    function handleKeyDown(event) {
      if (event.target instanceof HTMLElement && event.target.matches('button,input,textarea,select,[contenteditable="true"]')) return;
      if (event.code === 'Space' || event.code === 'ArrowDown' || event.code === 'Enter') {
        if (game.state === 'playing') {
          event.preventDefault();
          initAudio();
          dropBrick();
        }
      }
    }

    function handleSession(event) {
      if (event.detail?.gameId !== 'languagetower') return;
      if (event.detail.event === 'paused') game.paused = true;
      if (event.detail.event === 'resumed' || event.detail.event === 'started') game.paused = false;
    }

    function handleMainMenu() {
      toMenu();
    }

    fitCanvas();
    window.addEventListener('resize', fitCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('esl-game-session', handleSession);
    window.addEventListener('languagetower:main-menu', handleMainMenu);
    initRain();
    buildDemo();
    frameId = window.requestAnimationFrame(loop);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', fitCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('esl-game-session', handleSession);
      window.removeEventListener('languagetower:main-menu', handleMainMenu);
      clearTimeout(game.overTimer);
      if (game.audio) void game.audio.close();
      actionsRef.current = {};
    };
  }, []);

  const submitName = event => {
    event.preventDefault();
    actionsRef.current.saveName?.(playerName);
  };
  const challenge = gameRef.current.challenge;
  const challengePlayer = challenge?.players[challenge.currentPlayer];
  const challengeSentence = challengePlayer?.words ?? [];
  const challengeWinner = challenge
    ? challenge.players[0].score === challenge.players[1].score
      ? null
      : challenge.players[0].score > challenge.players[1].score ? 0 : 1
    : null;
  return (
    <div className={`lt-root${screen?.startsWith('challenge') ? ' is-challenge' : ''}${screen ? ' has-overlay' : ''}`}>
      <main className="lt-board" aria-label="Language Tower game" data-challenge-phase={challengeView?.phase}>
        <canvas
          ref={canvasRef}
          className="lt-canvas"
          aria-label="Language Tower. Tap, click, or press Space to drop the moving brick."
          onPointerDown={() => {
            if (gameRef.current.state === 'playing') actionsRef.current.drop?.();
          }}
        />
        {hudVisible && (
          <div className="lt-hud">
            <header className="lt-topbar">
              <div className="lt-score-wrap" aria-live="polite">
                <div className="lt-score" style={{ fontSize: hud.size }}>{hud.score}</div>
                <div className="lt-score-sub">{hud.subtitle}</div>
              </div>
            </header>
            <div className="lt-timer" aria-label="Time remaining"><div className="lt-timer-bar" ref={timerBarRef} /></div>
            {prompt && (
              <section className="lt-prompt" aria-label="Word-building prompt">
                {prompt.mode === 'esl' ? prompt.words.map((word, index) => (
                  <span key={`${word}-${index}`} className={`lt-word${index < prompt.placed ? ' is-done' : ''}${index === prompt.placed ? ' is-current' : ''}`}>{word}</span>
                )) : (
                  <>
                    <div className="lt-prompt-emoji">{prompt.word.emoji}</div>
                    <div className="lt-phonics-slots">{prompt.word.sounds.map((sound, index) => (
                      <span key={`${sound}-${index}`} className={`lt-word${index < prompt.soundIndex ? ' is-done' : ''}${index === prompt.soundIndex ? ' is-current' : ''}`}>{sound}</span>
                    ))}</div>
                    <div className="lt-prompt-meta">WORD {prompt.wordIndex + 1} / {prompt.level.words.length} · {prompt.level.name.toUpperCase()}</div>
                  </>
                )}
              </section>
            )}
            {rainWarning && <div className="lt-rain-warning" role="status">RAIN IS ERODING YOUR BLOCK</div>}
          </div>
        )}

        {screen && (
          <div className="lt-overlay" role="dialog" aria-modal="true" aria-label="Language Tower menu">
            {screen === 'info' && (
              <section className="lt-panel">
                <h1>LANGUAGE<br /><span>TOWER</span></h1>
                <p>Stack bricks. Build words. Beat the clock.</p>
                <form onSubmit={submitName}>
                  <label className="lt-field">
                    <span>YOUR NAME</span>
                    <input ref={nameInputRef} value={playerName} onChange={event => setPlayerName(event.target.value)} maxLength={16} placeholder="Player" autoComplete="off" autoCapitalize="words" spellCheck="false" />
                  </label>
                  <button className="lt-button" type="submit">CONTINUE</button>
                </form>
              </section>
            )}
            {screen === 'menu' && (
              <section className="lt-panel lt-menu-panel">
                <div className="lt-hello">HI, {playerName.toUpperCase()}</div>
                <h1>MAIN<br /><span>MENU</span></h1>
                <div className="lt-modes">
                  <button className="lt-mode-btn is-challenge" type="button" onClick={() => actionsRef.current.openChallengeSetup?.()}>
                    <strong>SENTENCE CHALLENGE</strong><span>Race through three rounds. Play head-to-head or challenge the AI.</span><small>2 PLAYERS · 3 ROUNDS</small>
                  </button>
                  <button className="lt-mode-btn" type="button" onClick={() => actionsRef.current.startNormal?.()}>
                    <strong>NORMAL MODE</strong><span>Endless tower — every block counts. Chase the high score.</span><small>{bestScores.normal ? `BEST ${bestScores.normal}` : 'NO RECORD YET'}</small>
                  </button>
                  <button className="lt-mode-btn is-esl" type="button" onClick={() => actionsRef.current.startESL?.(0)}>
                    <strong>ESL MODE</strong><span>Build the tower one word at a time to finish each sentence.</span><small>{bestScores.esl ? `BEST LEVEL ${bestScores.esl}` : 'NO RECORD YET'}</small>
                  </button>
                  <button className="lt-mode-btn is-phonics" type="button" onClick={() => actionsRef.current.startPhonics?.(0)}>
                    <strong>PHONICS MODE</strong><span>Stack one sound at a time to spell each word.</span><small>{bestScores.phonics ? `BEST LEVEL ${bestScores.phonics}` : 'NO RECORD YET'}</small>
                  </button>
                  <button className="lt-mode-btn is-rain" type="button" onClick={() => actionsRef.current.startRain?.()}>
                    <strong>RAIN MODE</strong><span>Place each block before the rain erodes it away.</span><small>{bestScores.rain ? `BEST ${bestScores.rain}` : 'NO RECORD YET'}</small>
                  </button>
                </div>
                <div className="lt-hint">TAP / SPACE TO DROP · TIMER RESETS ON EACH BLOCK</div>
                <div className="lt-tip">3 PERFECTS IN A ROW → NEXT BLOCK IS LONGER</div>
              </section>
            )}
            {screen === 'challenge-info' && (
              <section className="lt-panel lt-challenge-setup">
                <div className="lt-hello">THREE ROUNDS · WORDS · STREAKS</div>
                <h2>SENTENCE<br />CHALLENGE</h2>
                <p>Take turns finding the words that complete your sentence. Leave Player 2 blank to play against the AI.</p>
                <form onSubmit={event => { event.preventDefault(); actionsRef.current.startSentenceChallenge?.(challengeNames.playerOne, challengeNames.playerTwo); }}>
                  <label className="lt-field">
                    <span>PLAYER 1</span>
                    <input value={challengeNames.playerOne} onChange={event => setChallengeNames(names => ({ ...names, playerOne: event.target.value }))} maxLength={16} autoComplete="off" autoCapitalize="words" />
                  </label>
                  <label className="lt-field">
                    <span>PLAYER 2 <small>(OPTIONAL)</small></span>
                    <input value={challengeNames.playerTwo} onChange={event => setChallengeNames(names => ({ ...names, playerTwo: event.target.value }))} maxLength={16} placeholder="Blank = AI Challenger" autoComplete="off" autoCapitalize="words" />
                  </label>
                  <div className="lt-button-row">
                    <button className="lt-button" type="submit">START CHALLENGE</button>
                    <button className="lt-button is-ghost" type="button" onClick={() => actionsRef.current.toMenu?.()}>BACK</button>
                  </div>
                </form>
              </section>
            )}
            {screen === 'challenge-playing' && challenge && challengePlayer && challenge.phase !== 'round-complete' && (
              <section className="lt-panel lt-challenge-panel" aria-live="polite">
                <div className="lt-hello">ROUND {challenge.round} OF {SENTENCE_CHALLENGE_ROUNDS.length}</div>
                <h2>{challenge.phase === 'ai-thinking' ? `${challengePlayer.name} IS CHOOSING…` : `${challengePlayer.name.toUpperCase()}'S TURN`}</h2>
                <p className="lt-challenge-subtitle">
                  {challengePlayer.name} has found {challengePlayer.roundFound} of {challengeSentence.length} words this round
                  {challengePlayer.streak > 1 ? ` · ${challengePlayer.streak} word streak!` : ''}
                </p>
                <div className="lt-challenge-sentence" aria-label="Sentence progress">
                  {challengeSentence.map((word, index) => {
                    const revealed = index < challengePlayer.wordIndex
                      || (challenge.reveal?.playerIndex === challenge.currentPlayer && challenge.reveal.blockIndex === index);
                    return <span className={revealed ? 'is-revealed' : ''} key={`${word}-${index}`}>{revealed ? word : '＿'}</span>;
                  })}
                </div>
                <p className="lt-challenge-feedback" role="status">
                  {challenge.feedback || (challenge.phase === 'ai-thinking' ? 'The AI is picking a block…' : 'Choose the letter block for the next word.')}
                </p>
                <div className="lt-letter-blocks" aria-label="Choose a letter block">
                  {challengePlayer.blockOrder.map(index => {
                    const word = challengeSentence[index];
                    return (
                    <button
                      key={`${word}-${index}`}
                      className="lt-letter-block"
                      type="button"
                      disabled={challenge.phase !== 'playing' || challengePlayer.isAI || index < challengePlayer.wordIndex || challengePlayer.tried.has(index)}
                      onClick={() => actionsRef.current.chooseChallengeBlock?.(index)}
                      aria-label={`Block ${index + 1}, letter ${word.replace(/[^a-z]/i, '').charAt(0).toUpperCase() || 'blank'}`}
                    >
                      {word.replace(/[^a-z]/i, '').charAt(0).toUpperCase() || '•'}
                    </button>
                    );
                  })}
                </div>
                <div className="lt-challenge-points">
                  <span>{challenge.players[0].name}: <b>{challenge.players[0].score}</b></span>
                  <span>{challenge.players[1].name}: <b>{challenge.players[1].score}</b></span>
                </div>
              </section>
            )}
            {screen === 'challenge-playing' && challenge?.phase === 'round-complete' && (
              <section className="lt-panel lt-challenge-panel">
                <div className="lt-fail-icon">🏁</div>
                <div className="lt-hello">ROUND {challenge.round} COMPLETE</div>
                <h2>{challenge.roundWinner === null ? 'IT’S A TIE!' : `${challenge.players[challenge.roundWinner].name.toUpperCase()} WINS THE ROUND!`}</h2>
                <p>{challenge.feedback}</p>
                <div className="lt-challenge-points">
                  {challenge.players.map((player, index) => <span key={index}>{player.name}: <b>{player.roundFound} words · {player.roundPoints} points</b></span>)}
                </div>
                <button className="lt-button" type="button" onClick={() => actionsRef.current.continueChallenge?.()}>
                  {challenge.round < SENTENCE_CHALLENGE_ROUNDS.length ? 'NEXT ROUND' : 'SEE FINAL RESULTS'}
                </button>
              </section>
            )}
            {screen === 'challenge-victory' && challenge && (
              <section className="lt-panel lt-challenge-victory">
                <div className="lt-fail-icon">🏆</div>
                <div className="lt-hello">THREE ROUNDS COMPLETE</div>
                <h2>{challengeWinner === null ? 'IT’S A TIE!' : `${challenge.players[challengeWinner].name.toUpperCase()} WINS!`}</h2>
                <div className="lt-challenge-results">
                  {challenge.players.map((player, index) => (
                    <article className={`lt-result-card${challengeWinner === index ? ' is-winner' : ''}`} key={index}>
                      <h3>{player.name}</h3>
                      <strong>{player.score} <small>POINTS</small></strong>
                      <dl>
                        <div><dt>Words found</dt><dd>{player.wordsFound} / {player.totalWordsAvailable}</dd></div>
                        <div><dt>Streaks</dt><dd>{player.streaks}</dd></div>
                        <div><dt>Longest streak</dt><dd>{player.longestStreak}</dd></div>
                        <div><dt>Best round</dt><dd>Round {player.bestRound}</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {screen === 'gameover' && (
              <section className="lt-panel">
                <div className="lt-fail-icon">{gameRef.current.mode === 'rain' ? '🌧️' : '🧱'}</div>
                <h2>{gameRef.current.mode === 'rain' ? 'WASHED OUT!' : 'GAME OVER'}</h2>
                {gameRef.current.mode === 'rain' && <p>The rain ate through your block.</p>}
                <div className="lt-big-score">{gameRef.current.score}</div>
                <div className="lt-sub">BEST {gameRef.current.mode === 'rain' ? bestScores.rain : bestScores.normal}</div>
                {screenData.isNewBest && <div className="lt-new-best">NEW BEST!</div>}
                <div className="lt-button-row">
                  <button className="lt-button" type="button" onClick={() => actionsRef.current.playAgain?.()}>PLAY AGAIN</button>
                </div>
              </section>
            )}
            {screen === 'levelfailed' && (
              <section className="lt-panel">
                <div className="lt-fail-icon">{screenData.reason === 'time' ? '⏰' : screenData.reason === 'miss' ? '💥' : '🧱'}</div>
                <h2>{screenData.reason === 'time' ? "TIME'S UP!" : screenData.reason === 'miss' ? 'MISSED!' : 'TOWER COLLAPSED!'}</h2>
                <p>{screenData.reason === 'time' ? 'The timer ran out before you placed the next block.' : screenData.reason === 'miss' ? 'Your block missed the tower completely.' : 'That block was too far off — the tower got too thin.'}</p>
                {gameRef.current.mode === 'esl' ? (
                  <>
                    <div className="lt-sub">LEVEL {gameRef.current.eslLevel + 1} · {gameRef.current.eslPlaced} / {gameRef.current.eslWords.length} WORDS</div>
                    {gameRef.current.eslPlaced > 0 && <div className="lt-sentence-show">{gameRef.current.eslWords.slice(0, gameRef.current.eslPlaced).join(' ')} …</div>}
                  </>
                ) : (
                  <div className="lt-sub">LEVEL {gameRef.current.phonicsLevel + 1} · WORD {gameRef.current.phonicsWord + 1} / {PHONICS_LEVELS[gameRef.current.phonicsLevel].words.length}</div>
                )}
                <div className="lt-button-row">
                  <button className="lt-button" type="button" onClick={() => actionsRef.current.retry?.()}>RETRY</button>
                </div>
              </section>
            )}
            {screen === 'levelcomplete' && (
              <section className="lt-panel">
                <div className="lt-fail-icon">🎉</div>
                <h2>{gameRef.current.mode === 'esl'
                  ? gameRef.current.eslLevel === SENTENCES.length - 1 ? 'ALL SENTENCES DONE!' : 'SENTENCE COMPLETE!'
                  : gameRef.current.phonicsLevel === PHONICS_LEVELS.length - 1 ? 'ALL WORDS SPELLED!' : 'LEVEL COMPLETE!'}</h2>
                <div className="lt-sub">{gameRef.current.mode === 'esl'
                  ? `LEVEL ${gameRef.current.eslLevel + 1} · ${gameRef.current.eslWords.length} WORDS`
                  : `LEVEL ${gameRef.current.phonicsLevel + 1} · ${PHONICS_LEVELS[gameRef.current.phonicsLevel].name.toUpperCase()}`}</div>
                <div className="lt-sentence-show">{gameRef.current.mode === 'esl'
                  ? gameRef.current.eslWords.join(' ')
                  : PHONICS_LEVELS[gameRef.current.phonicsLevel].words.map(word => `${word.emoji} ${word.word}`).join(' · ')}</div>
                <div className="lt-button-row">
                  {((gameRef.current.mode === 'esl' && gameRef.current.eslLevel < SENTENCES.length - 1)
                    || (gameRef.current.mode === 'phonics' && gameRef.current.phonicsLevel < PHONICS_LEVELS.length - 1)) && (
                    <button className="lt-button" type="button" onClick={() => actionsRef.current.next?.()}>NEXT LEVEL</button>
                  )}
                </div>
              </section>
            )}
            {screen === 'canvas-error' && (
              <section className="lt-panel">
                <div className="lt-fail-icon">⚠️</div>
                <h2>CANVAS UNAVAILABLE</h2>
                <p>This browser can’t display Language Tower. Try a current browser with canvas support.</p>
              </section>
            )}
          </div>
        )}
      </main>
      <style>{STYLES}</style>
    </div>
  );
}

const STYLES = `
.lt-root { width:100%; height:100%; min-height:100%; display:grid; place-items:center; overflow:hidden; background:#060b14; color:#fff; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; -webkit-tap-highlight-color:transparent; user-select:none; }
.lt-board { position:relative; width:auto; height:min(100%,calc(100vw * 1.5556),700px); max-width:100%; aspect-ratio:450 / 700; overflow:hidden; background:#060b14; box-shadow:0 0 80px rgba(0,0,0,.8); }
.lt-canvas { display:block; width:100%; height:100%; touch-action:manipulation; }
.lt-hud { position:absolute; inset:0; pointer-events:none; color:#fff; }
.lt-topbar { position:absolute; top:0; left:0; right:0; height:66px; display:flex; align-items:center; justify-content:space-between; padding:8px 12px 0; }
.lt-icon-btn { width:38px; height:38px; flex:0 0 auto; display:grid; place-items:center; border:0; border-radius:10px; background:rgba(255,255,255,.09); color:#fff; font-size:19px; line-height:1; cursor:pointer; pointer-events:auto; }
.lt-icon-btn:hover { background:rgba(255,255,255,.18); }
.lt-score-wrap { flex:1; text-align:center; }
.lt-score { font-weight:900; letter-spacing:-2px; line-height:1; text-shadow:0 4px 0 rgba(0,0,0,.35),0 0 30px rgba(120,180,255,.3); }
.lt-score-sub { margin-top:4px; color:rgba(255,255,255,.55); font-size:11px; font-weight:800; letter-spacing:2px; }
.lt-timer { position:absolute; top:74px; left:14px; right:14px; height:9px; overflow:hidden; border-radius:99px; background:rgba(255,255,255,.1); box-shadow:inset 0 1px 2px rgba(0,0,0,.35); }
.lt-timer-bar { width:100%; height:100%; border-radius:99px; background:linear-gradient(90deg,#00E676,#7CFF9B); transition:width .08s linear,background .3s; }
.lt-prompt { position:absolute; top:94px; left:12px; right:12px; padding:11px 16px; border:1px solid rgba(255,255,255,.09); border-radius:14px; background:rgba(255,255,255,.07); text-align:center; font-size:17px; font-weight:700; line-height:1.55; }
.lt-word { display:inline-block; margin:0 2px; opacity:.25; transition:opacity .25s ease,color .25s ease; }
.lt-word.is-done { opacity:1; color:#B9F6CA; }
.lt-word.is-current { color:#FFCF00; opacity:.85; animation:lt-pulse 1.1s ease-in-out infinite; }
.lt-prompt-emoji { font-size:28px; line-height:1.15; }
.lt-phonics-slots { font-size:21px; font-weight:900; letter-spacing:2px; }
.lt-prompt-meta { margin-top:5px; color:rgba(255,255,255,.48); font-size:10px; font-weight:800; letter-spacing:2px; }
.lt-rain-warning { position:absolute; top:118px; left:0; right:0; color:#9FD3FF; text-align:center; font-size:12px; font-weight:900; letter-spacing:3px; text-shadow:0 2px 0 rgba(0,0,0,.4),0 0 18px rgba(120,190,255,.7); animation:lt-warning .85s ease-in-out infinite; }
.lt-overlay { position:absolute; z-index:2; inset:0; display:flex; align-items:center; justify-content:center; overflow-y:auto; padding:24px 0; background:radial-gradient(circle at 50% 40%,rgba(12,24,46,.78),rgba(4,8,16,.96)); }
.lt-panel { width:100%; max-width:380px; margin:auto; padding:0 26px; text-align:center; animation:lt-pop .35s cubic-bezier(.2,1.4,.5,1) both; }
.lt-panel h1 { margin:0 0 16px; color:#fff; font-size:44px; font-weight:900; letter-spacing:-1px; line-height:.95; text-shadow:0 5px 0 #1b3a6b,0 12px 30px rgba(0,0,0,.6); }
.lt-panel h1 span { color:#FFCF00; }
.lt-panel h2 { margin:0 0 8px; color:#fff; font-size:27px; font-weight:900; letter-spacing:1.5px; text-shadow:0 4px 0 rgba(0,0,0,.35); }
.lt-panel p { margin:0 0 20px; color:rgba(255,255,255,.68); font-size:14.5px; line-height:1.6; }
.lt-hello { margin-bottom:10px; color:#7CFF9B; font-size:12px; font-weight:800; letter-spacing:2.5px; }
.lt-field { display:block; margin-bottom:22px; text-align:left; }
.lt-field span { display:block; margin:0 0 8px; padding-left:4px; color:rgba(255,255,255,.5); font-size:11px; font-weight:800; letter-spacing:2px; }
.lt-field input { width:100%; padding:14px 16px; border:2px solid rgba(255,255,255,.16); border-radius:14px; outline:none; background:rgba(255,255,255,.07); color:#fff; font:inherit; font-size:18px; font-weight:700; }
.lt-field input:focus { border-color:#FFCF00; background:rgba(255,255,255,.11); }
.lt-field input::placeholder { color:rgba(255,255,255,.35); }
.lt-button { display:inline-block; margin:4px 0; padding:15px 28px; border:0; border-radius:14px; background:linear-gradient(#FFD93B,#FFC400); box-shadow:0 6px 0 #a88400,0 14px 28px rgba(0,0,0,.45); color:#1a1400; font:inherit; font-size:16px; font-weight:800; letter-spacing:1px; cursor:pointer; }
.lt-button:hover { filter:brightness(1.06); }
.lt-button:active { transform:translateY(4px); box-shadow:0 2px 0 #a88400; }
.lt-button.is-ghost { border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.1); box-shadow:none; color:#fff; }
.lt-menu-panel { max-width:420px; }
.lt-modes { display:flex; flex-direction:column; gap:9px; }
.lt-mode-btn { width:100%; padding:12px 15px; border:2px solid rgba(255,255,255,.13); border-radius:16px; background:rgba(255,255,255,.06); color:#fff; text-align:left; cursor:pointer; }
.lt-mode-btn:hover { border-color:rgba(255,255,255,.28); background:rgba(255,255,255,.11); }
.lt-mode-btn strong,.lt-mode-btn span,.lt-mode-btn small { display:block; }
.lt-mode-btn strong { margin-bottom:3px; color:#7CFF9B; font-size:17px; font-weight:900; letter-spacing:1.2px; }
.lt-mode-btn span { color:rgba(255,255,255,.58); font-size:12px; font-weight:600; line-height:1.4; }
.lt-mode-btn small { display:inline-block; margin-top:7px; padding:3px 10px; border-radius:999px; background:rgba(124,255,155,.12); color:#7CFF9B; font-size:10px; font-weight:800; letter-spacing:1.3px; }
.lt-mode-btn.is-phonics strong,.lt-mode-btn.is-phonics small { color:#64B5F6; }
.lt-mode-btn.is-phonics small { background:rgba(100,181,246,.13); }
.lt-mode-btn.is-rain strong,.lt-mode-btn.is-rain small { color:#9FD3FF; }
.lt-mode-btn.is-rain small { background:rgba(159,211,255,.13); }
.lt-mode-btn.is-esl strong,.lt-mode-btn.is-esl small { color:#7CFF9B; }
.lt-mode-btn.is-challenge strong,.lt-mode-btn.is-challenge small { color:#FFCF00; }
.lt-mode-btn.is-challenge small { background:rgba(255,207,0,.13); }
.lt-hint { display:inline-block; margin-top:18px; padding:7px 12px; border:1px solid rgba(255,255,255,.15); border-radius:999px; color:rgba(255,255,255,.52); font-size:9px; font-weight:700; letter-spacing:1px; }
.lt-tip { margin-top:10px; color:#7CFF9B; font-size:10px; font-weight:800; letter-spacing:1px; }
.lt-challenge-setup { max-width:440px; }
.lt-challenge-panel { max-width:620px; }
.lt-challenge-subtitle { margin-bottom:12px !important; }
.lt-challenge-sentence { display:flex; flex-wrap:wrap; justify-content:center; gap:5px 8px; margin:0 auto 14px; padding:13px 10px; border:1px solid rgba(255,255,255,.12); border-radius:14px; background:rgba(255,255,255,.07); color:rgba(255,255,255,.48); font-size:clamp(15px,3vw,21px); font-weight:800; line-height:1.55; }
.lt-challenge-sentence span { min-height:1.55em; }
.lt-challenge-sentence .is-revealed { color:#B9F6CA; }
.lt-challenge-feedback { min-height:1.5em; margin:0 0 12px !important; color:#FFCF00 !important; font-size:13px !important; font-weight:800; }
.lt-letter-blocks { display:grid; grid-template-columns:repeat(auto-fit,minmax(46px,1fr)); gap:8px; margin:0 auto 16px; max-width:500px; }
.lt-letter-block { min-width:0; min-height:48px; border:2px solid rgba(255,255,255,.2); border-radius:12px; background:linear-gradient(145deg,#377dcc,#164880); box-shadow:0 4px 0 #0b2c4f; color:#fff; font:900 20px/1 system-ui,sans-serif; cursor:pointer; touch-action:manipulation; }
.lt-letter-block:hover:not(:disabled),.lt-letter-block:focus-visible { border-color:#FFCF00; outline:2px solid rgba(255,207,0,.42); outline-offset:2px; }
.lt-letter-block:disabled { opacity:.42; cursor:default; }
.lt-challenge-points { display:flex; justify-content:center; flex-wrap:wrap; gap:8px 18px; color:rgba(255,255,255,.68); font-size:12px; font-weight:700; }
.lt-challenge-points b { color:#fff; }
.lt-challenge-victory { max-width:780px; }
.lt-challenge-results { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin:16px 0; text-align:left; }
.lt-result-card { min-width:0; padding:15px; border:1px solid rgba(255,255,255,.12); border-radius:16px; background:rgba(255,255,255,.06); }
.lt-result-card.is-winner { border-color:rgba(255,207,0,.65); background:rgba(255,207,0,.09); }
.lt-result-card h3 { overflow-wrap:anywhere; margin:0 0 8px; font-size:16px; }
.lt-result-card > strong { display:block; margin-bottom:12px; color:#FFCF00; font-size:30px; line-height:1; }
.lt-result-card > strong small { font-size:10px; letter-spacing:1px; }
.lt-result-card dl { display:grid; gap:7px; margin:0; }
.lt-result-card dl div { display:flex; justify-content:space-between; gap:8px; font-size:12px; }
.lt-result-card dt { color:rgba(255,255,255,.62); }
.lt-result-card dd { margin:0; color:#fff; font-weight:800; text-align:right; }
.lt-fail-icon { margin-bottom:8px; font-size:42px; }
.lt-big-score { margin:6px 0 4px; color:#FFCF00; font-size:66px; font-weight:900; letter-spacing:-3px; line-height:1; text-shadow:0 5px 0 #9a7b00; }
.lt-sub { margin-bottom:18px; color:rgba(255,255,255,.58); font-size:12px; font-weight:700; letter-spacing:1.5px; }
.lt-new-best { display:inline-block; margin-bottom:18px; padding:5px 14px; border-radius:999px; background:#00E676; color:#0d1b2a; font-size:12px; font-weight:800; letter-spacing:2px; }
.lt-sentence-show { margin-bottom:18px; padding:13px 15px; border:1px solid rgba(255,255,255,.09); border-radius:14px; background:rgba(255,255,255,.06); color:#B9F6CA; font-size:15px; font-weight:700; line-height:1.5; }
.lt-button-row { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; }
@keyframes lt-pulse { 0%,100% { opacity:.45; } 50% { opacity:1; } }
@keyframes lt-warning { 0%,100% { opacity:.45; } 50% { opacity:1; } }
@keyframes lt-pop { from { transform:scale(.86); opacity:0; } to { transform:scale(1); opacity:1; } }
@media (max-width:480px) { .lt-panel { padding-right:20px; padding-left:20px; } .lt-panel h1 { font-size:38px; } .lt-mode-btn { padding:10px 12px; } .lt-mode-btn strong { font-size:15px; } .lt-mode-btn span { font-size:11px; } .lt-overlay { padding:14px 0; } .lt-letter-blocks { grid-template-columns:repeat(auto-fit,minmax(40px,1fr)); gap:6px; } .lt-letter-block { min-height:42px; font-size:18px; } .lt-challenge-results { gap:8px; } .lt-result-card { padding:11px; } }
@media (max-width:360px) { .lt-challenge-results { grid-template-columns:1fr; } .lt-challenge-points { font-size:11px; } .lt-button { padding:13px 18px; font-size:14px; } }
@media (max-height:700px) {
  .lt-overlay { padding-top:8px; padding-bottom:8px; }
  .lt-menu-panel h1 { margin-bottom:10px; font-size:34px; }
  .lt-menu-panel .lt-hello { margin-bottom:6px; font-size:10px; }
  .lt-menu-panel .lt-modes { gap:6px; }
  .lt-menu-panel .lt-mode-btn { padding:8px 10px; border-radius:12px; }
  .lt-menu-panel .lt-mode-btn strong { font-size:14px; }
  .lt-menu-panel .lt-mode-btn span { font-size:10px; line-height:1.3; }
  .lt-menu-panel .lt-mode-btn small { margin-top:4px; padding:2px 8px; font-size:9px; }
  .lt-menu-panel .lt-hint { margin-top:10px; padding:5px 8px; font-size:8px; }
  .lt-menu-panel .lt-tip { margin-top:6px; font-size:9px; }
  .lt-challenge-setup h2 { font-size:22px; }
  .lt-challenge-setup p { margin-bottom:10px; font-size:12px; line-height:1.45; }
  .lt-challenge-setup .lt-field { margin-bottom:12px; }
  .lt-challenge-setup .lt-field span { margin-bottom:4px; }
  .lt-challenge-setup .lt-field input { padding:11px 12px; }
  .lt-challenge-setup .lt-button { padding:12px 16px; font-size:14px; }
}
@media (max-height:520px) { .lt-overlay { align-items:flex-start; padding:8px 0; } .lt-panel { flex:0 0 auto; margin:0 auto; } .lt-panel h1 { font-size:34px; } .lt-fail-icon { margin-bottom:2px; font-size:30px; } .lt-panel p { margin-bottom:10px; } .lt-challenge-sentence { padding:8px; } .lt-letter-block { min-height:38px; } }
@media (orientation:landscape) and (max-height:520px) {
  .lt-root.has-overlay .lt-board { width:100%; height:100%; max-width:none; aspect-ratio:auto; }
  .lt-root.has-overlay .lt-overlay { padding-block:4px; }
  .lt-root.has-overlay .lt-menu-panel { display:grid; grid-template-columns:minmax(170px,.8fr) minmax(0,1.5fr); grid-template-rows:auto auto 1fr auto; grid-template-areas:"hello modes" "title modes" "hint modes" "tip modes"; gap:0 20px; align-items:center; max-width:760px; padding:12px 20px; text-align:left; }
  .lt-root.has-overlay .lt-menu-panel .lt-hello { grid-area:hello; }
  .lt-root.has-overlay .lt-menu-panel h1 { grid-area:title; }
  .lt-root.has-overlay .lt-menu-panel .lt-modes { grid-area:modes; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .lt-root.has-overlay .lt-menu-panel .lt-hint { grid-area:hint; margin:4px 0; }
  .lt-root.has-overlay .lt-menu-panel .lt-tip { grid-area:tip; margin:4px 0; }
  .lt-root.is-challenge .lt-challenge-setup { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:4px 20px; align-items:center; max-width:700px; padding:12px 20px; text-align:left; }
  .lt-root.is-challenge .lt-challenge-setup form { grid-column:2; grid-row:1 / 4; min-width:0; }
  .lt-root.is-challenge .lt-challenge-setup .lt-field { margin-bottom:8px; }
  .lt-root.is-challenge .lt-challenge-setup .lt-button-row { gap:6px; }
  .lt-root.is-challenge .lt-challenge-panel { max-width:760px; }
  .lt-root.is-challenge .lt-challenge-victory { max-width:800px; }
  .lt-root.is-challenge .lt-challenge-panel h2 { font-size:20px; }
  .lt-root.is-challenge .lt-challenge-panel p { font-size:12px; }
  .lt-root.is-challenge .lt-challenge-sentence { margin-bottom:8px; padding:7px; font-size:16px; }
  .lt-root.is-challenge .lt-letter-blocks { gap:5px; margin-bottom:8px; }
  .lt-root.is-challenge .lt-letter-block { min-height:34px; }
  .lt-root.is-challenge .lt-challenge-feedback { margin-bottom:6px !important; }
  .lt-root.is-challenge .lt-challenge-results { margin:8px 0; }
}
`;
