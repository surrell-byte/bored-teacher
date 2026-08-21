import React, { useEffect, useRef } from 'react';

/**
 * ZooGame
 * Auto-converted from zoo_game__4_.html into a self-contained React component.
 * The original HTML markup is injected via a ref + innerHTML, the original
 * <style> block is scoped inside the component via a <style> tag, and the
 * original vanilla-JS game logic runs unmodified inside a useEffect after
 * mount (it manipulates the DOM directly, exactly as it did in the static
 * HTML page).
 */
const ZooGame_HTML = `<div class="game-wrapper" role="main" aria-label="Zoo animal guessing game">

        <!-- HEADER -->
        <header class="zoo-header">
            <h1>🦁 Zoo <span>Game</span></h1>
            <div class="score-badge">⭐ <span id="scoreDisplay">0</span></div>
        </header>

        <!-- CATEGORY TABS -->
        <div class="category-tabs" role="tablist" aria-label="Animal categories">
            <button class="cat-btn active" data-category="zoo" role="tab" aria-selected="true">🦁 Zoo Animals</button>
            <button class="cat-btn" data-category="farm" role="tab" aria-selected="false">🚜 Farm Animals</button>
            <button class="cat-btn" data-category="sea" role="tab" aria-selected="false">🐠 Sea Animals</button>
        </div>

        <!-- MODE TABS -->
        <div class="tabs" role="tablist">
            <button class="tab-btn active" data-tab="guess" role="tab" aria-selected="true">
                🤔 Guess & Say
            </button>
            <button class="tab-btn" data-tab="act" role="tab" aria-selected="false">
                🎭 Act & Say
            </button>
            <button class="tab-btn" data-tab="look" role="tab" aria-selected="false">
                👀 Look, Listen & Say
            </button>
        </div>

        <!-- ============================================================ -->
        <!-- PANEL 1 – GUESS & SAY                                         -->
        <!-- ============================================================ -->
        <section class="panel active" id="panel-guess" role="tabpanel">
            <div class="instruction">
                🕵️‍♂️ Guess! <small>— What animal do you see?</small>
            </div>

            <div class="animal-display" id="guessDisplay">
                <div class="animal-emoji partial" id="guessEmoji">🦒</div>
                <div class="animal-name hidden" id="guessName">Giraffe</div>
            </div>

            <div class="options-grid" id="guessOptions"></div>

            <div class="attempts-track" id="guessAttemptsTrack">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="feedback" id="guessFeedback">💡 Click an animal to guess!</div>
        </section>

        <!-- ============================================================ -->
        <!-- PANEL 2 – ACT & SAY                                           -->
        <!-- ============================================================ -->
        <section class="panel" id="panel-act" role="tabpanel">
            <div class="instruction">
                🎭 Act & Say! <small>— Act like the animal and say the sentence.</small>
            </div>

            <div class="act-card">
                <div class="animal-display" style="min-height:190px; padding:14px;">
                    <div class="animal-emoji partial" id="actEmoji">🦒</div>
                    <div class="animal-name hidden" id="actName">Giraffe</div>
                </div>
                <div class="speech-bubble" id="actSentence">I see a giraffe.</div>
                <div style="margin-top:6px; font-size:15px; color:#7a6248;">
                    🗣️ Say it out loud!
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-success" id="actCheckBtn">✅ I said it!</button>
            </div>

            <div class="feedback" id="actFeedback">👆 Act it out, then press the button!</div>
        </section>

        <!-- ============================================================ -->
        <!-- PANEL 3 – LOOK, LISTEN & SAY                                  -->
        <!-- ============================================================ -->
        <section class="panel" id="panel-look" role="tabpanel">
            <div class="instruction">
                👀 Look, Listen & Say! <small>— Complete the sentence.</small>
            </div>

            <div class="animal-display" style="min-height:190px; padding:14px;">
                <div class="animal-emoji partial" id="lookEmoji">🦒</div>
                <div class="animal-name hidden" id="lookName">Giraffe</div>
            </div>

            <div class="sentence-builder" id="sentenceBuilder">
                <span class="word">I</span>
                <span class="word">see</span>
                <span class="blank" id="lookBlank">⋯</span>
                <span class="word">in</span>
                <span class="word">the</span>
                <span class="word">zoo.</span>
            </div>

            <div class="options-grid" id="lookOptions" style="max-width:480px;"></div>

            <div class="attempts-track" id="lookAttemptsTrack">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="action-buttons">
                <button class="btn btn-blue" id="lookHintBtn">💡 Hint</button>
            </div>

            <div class="feedback" id="lookFeedback">🔤 Choose the right word to complete the sentence!</div>
        </section>

    </div>`;

const ZooGame_CSS = `/* ---------- RESET & BASE ---------- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
        }

        body {
            font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
            background: linear-gradient(145deg, #f8f0d5 0%, #e8dcc0 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 18px;
            margin: 0;
            overflow: hidden;
        }

        /* ---------- GAME CONTAINER ---------- */
        .game-wrapper {
            max-width: 980px;
            width: 100%;
            max-height: calc(100vh - 36px);
            background: #fff8e7;
            border-radius: 40px 40px 30px 30px;
            padding: 20px 26px 20px;
            box-shadow: 0 16px 50px rgba(0, 0, 0, 0.20),
                0 4px 12px rgba(0, 0, 0, 0.08);
            border: 6px solid #c7b28b;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        /* zoo fence decoration */
        .game-wrapper::before {
            content: '🌿🌿🌿';
            position: absolute;
            top: -14px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            letter-spacing: 12px;
            background: #fff8e7;
            padding: 0 16px;
            border-radius: 40px;
            white-space: nowrap;
        }

        /* ---------- HEADER ---------- */
        .zoo-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #d9c9a8;
            padding: 8px 20px;
            border-radius: 100px;
            margin-bottom: 12px;
            border: 4px solid #b8a07c;
            flex-wrap: wrap;
            gap: 10px;
        }

        .zoo-header h1 {
            font-size: 22px;
            color: #4a3728;
            letter-spacing: 2px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .zoo-header h1 span {
            background: #fce9c8;
            padding: 2px 14px;
            border-radius: 40px;
            font-size: 18px;
            border: 2px solid #b8a07c;
        }

        .score-badge {
            background: #4a3728;
            color: #fce9c8;
            padding: 5px 18px;
            border-radius: 40px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 3px solid #fce9c8;
        }

        /* ---------- CATEGORY TABS ---------- */
        .category-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .cat-btn {
            background: #efe3cd;
            border: 4px solid #c7b28b;
            padding: 8px 20px;
            border-radius: 60px;
            font-size: 17px;
            font-weight: bold;
            color: #4a3728;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            box-shadow: 0 4px 0 #b8a07c;
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 0 1 auto;
        }

        .cat-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 #b8a07c;
            background: #f5ecd9;
        }

        .cat-btn.active {
            background: #fcdb8a;
            border-color: #dba555;
            box-shadow: 0 4px 0 #b8863a;
            transform: translateY(0);
        }

        .cat-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0px 0 #b8a07c;
        }

        /* ---------- MODE TABS ---------- */
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 14px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .tab-btn {
            background: #efe3cd;
            border: 4px solid #c7b28b;
            padding: 10px 22px;
            border-radius: 60px;
            font-size: 17px;
            font-weight: bold;
            color: #4a3728;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            box-shadow: 0 4px 0 #b8a07c;
            flex: 1 1 auto;
            min-width: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .tab-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 #b8a07c;
            background: #f5ecd9;
        }

        .tab-btn.active {
            background: #fcdb8a;
            border-color: #dba555;
            box-shadow: 0 4px 0 #b8863a;
            transform: translateY(0);
        }

        .tab-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0px 0 #b8a07c;
        }

        /* ---------- PANELS ---------- */
        .panel {
            display: none;
            animation: fadeUp 0.4s ease;
        }

        .panel.active {
            display: block;
        }

        @keyframes fadeUp {
            0% {
                opacity: 0;
                transform: translateY(18px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* ---------- INSTRUCTION ---------- */
        .instruction {
            text-align: center;
            font-size: 18px;
            color: #4a3728;
            background: #f5ecd9;
            padding: 8px 18px;
            border-radius: 60px;
            border: 3px dashed #b8a07c;
            margin-bottom: 12px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .instruction small {
            font-weight: normal;
            font-size: 15px;
            color: #7a6248;
        }

        /* ---------- ANIMAL DISPLAY ---------- */
        .animal-display {
            background: #fcf6e8;
            border-radius: 40px;
            padding: 20px 20px 16px;
            text-align: center;
            border: 5px solid #d9c9a8;
            min-height: 230px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            position: relative;
        }

        .animal-emoji {
            font-size: 140px;
            line-height: 1;
            transition: all 0.4s ease;
            user-select: none;
        }

        .animal-emoji.no-transition {
            transition: none !important;
        }

        .animal-emoji.partial {
            filter: blur(10px) brightness(0.65);
            transform: scale(0.85);
            transition: all 0.5s ease;
        }

        .animal-emoji.revealed {
            filter: blur(0) brightness(1);
            transform: scale(1);
        }

        .animal-name {
            font-size: 28px;
            font-weight: bold;
            color: #4a3728;
            margin-top: 8px;
            background: #fce9c8;
            padding: 3px 24px;
            border-radius: 60px;
            display: inline-block;
            border: 3px solid #c7b28b;
            min-width: 120px;
            transition: all 0.3s;
        }

        .animal-name.hidden {
            visibility: hidden;
            opacity: 0;
            transform: scale(0.8);
            min-height: 40px;
        }

        /* ---------- SENTENCE BUILDER (Look) ---------- */
        .sentence-builder {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 8px 6px;
            font-size: 24px;
            font-weight: bold;
            color: #4a3728;
            margin: 8px 0 6px;
            background: #f5ecd9;
            padding: 10px 16px;
            border-radius: 50px;
            border: 3px solid #c7b28b;
        }

        .sentence-builder .word {
            background: white;
            padding: 3px 14px;
            border-radius: 26px;
            border: 3px solid #d9c9a8;
        }

        .sentence-builder .blank {
            background: #fce9c8;
            padding: 3px 20px;
            border-radius: 26px;
            border: 4px dashed #dba555;
            min-width: 100px;
            display: inline-block;
            text-align: center;
            color: #b8863a;
            cursor: default;
            transition: 0.2s;
        }

        .sentence-builder .blank.filled {
            border: 4px solid #6a9b5a;
            background: #d4edc9;
            color: #2d5a1e;
        }

        /* ---------- BUTTONS ---------- */
        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-top: 12px;
        }

        .btn {
            padding: 10px 26px;
            border: none;
            border-radius: 60px;
            font-size: 18px;
            font-weight: bold;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 6px 0 rgba(0, 0, 0, 0.15);
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: 3px solid rgba(255, 255, 255, 0.4);
        }

        .btn:active {
            transform: translateY(6px);
            box-shadow: 0 0px 0 rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
            background: #fcdb8a;
            color: #4a3728;
        }
        .btn-primary:hover {
            background: #fde6a5;
            transform: translateY(-2px);
        }

        .btn-success {
            background: #8bc78b;
            color: #1f4a1f;
        }
        .btn-success:hover {
            background: #a2dba2;
            transform: translateY(-2px);
        }

        .btn-pink {
            background: #f7b8c4;
            color: #6a3040;
        }
        .btn-pink:hover {
            background: #fccfd8;
            transform: translateY(-2px);
        }

        .btn-blue {
            background: #89c2e8;
            color: #1a405a;
        }
        .btn-blue:hover {
            background: #a6d4f0;
            transform: translateY(-2px);
        }

        .btn-orange {
            background: #f5b07a;
            color: #5a3518;
        }
        .btn-orange:hover {
            background: #fcc292;
            transform: translateY(-2px);
        }

        .btn:disabled {
            opacity: 0.5;
            transform: translateY(0) !important;
            cursor: not-allowed;
            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
        }

        /* ---------- FEEDBACK ---------- */
        .feedback {
            margin-top: 12px;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 17px;
            font-weight: bold;
            text-align: center;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: #f5ecd9;
            border: 3px solid #d9c9a8;
            transition: all 0.3s;
        }

        .feedback.correct {
            background: #d4edc9;
            border-color: #6a9b5a;
            color: #2d5a1e;
        }

        .feedback.wrong {
            background: #fdd5d5;
            border-color: #c95a5a;
            color: #6a1e1e;
        }

        .feedback.hint {
            background: #fce9c8;
            border-color: #dba555;
            color: #7a5a2a;
        }

        /* ---------- OPTIONS GRID ---------- */
        .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
            gap: 10px;
            margin-top: 10px;
            width: 100%;
            max-width: 560px;
            margin-left: auto;
            margin-right: auto;
        }

        .option-btn {
            background: #fcf6e8;
            border: 4px solid #d9c9a8;
            border-radius: 34px;
            padding: 10px 6px;
            font-size: 20px;
            font-family: inherit;
            font-weight: bold;
            color: #4a3728;
            cursor: pointer;
            transition: all 0.15s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            box-shadow: 0 4px 0 #c7b28b;
        }

        .option-btn .opt-label {
            font-size: 18px;
        }

        .option-btn:hover {
            transform: translateY(-3px);
            background: #f5ecd9;
            box-shadow: 0 6px 0 #c7b28b;
        }

        .option-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0px 0 #c7b28b;
        }

        .option-btn.selected-correct {
            background: #8bc78b;
            border-color: #4a8a4a;
            box-shadow: 0 4px 0 #3a6a3a;
            transform: scale(1.02);
        }

        .option-btn.selected-wrong {
            background: #e88a8a;
            border-color: #b84a4a;
            box-shadow: 0 4px 0 #8a3a3a;
        }

        .option-btn:disabled {
            opacity: 0.7;
            transform: translateY(0) !important;
            cursor: not-allowed;
            box-shadow: 0 2px 0 #c7b28b;
        }

        /* ---------- ACT CARD ---------- */
        .act-card {
            background: #fcf6e8;
            border-radius: 34px;
            padding: 12px 20px 16px;
            border: 4px solid #d9c9a8;
            text-align: center;
        }

        .act-card .speech-bubble {
            background: white;
            padding: 10px 24px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: bold;
            color: #4a3728;
            display: inline-block;
            border: 4px solid #c7b28b;
            margin: 8px 0 4px;
            box-shadow: 0 6px 0 #c7b28b;
            position: relative;
        }

        .act-card .speech-bubble::before {
            content: '💬';
            position: absolute;
            left: -34px;
            top: -8px;
            font-size: 26px;
        }

        /* attempts dots */
        .attempts-track {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
        }

        .attempts-track .dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #e5d8b8;
            border: 2px solid #c7b28b;
            transition: all 0.25s ease;
        }

        .attempts-track .dot.used {
            background: #e88a8a;
            border-color: #b84a4a;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 600px) {
            .game-wrapper {
                padding: 16px 14px 18px;
                border-radius: 32px;
            }
            .zoo-header h1 {
                font-size: 20px;
            }
            .zoo-header h1 span {
                font-size: 16px;
                padding: 0 10px;
            }
            .cat-btn {
                font-size: 16px;
                padding: 8px 14px;
            }
            .tab-btn {
                font-size: 16px;
                padding: 10px 16px;
                min-width: 100px;
            }
            .instruction {
                font-size: 18px;
                padding: 10px 14px;
            }
            .animal-display {
                min-height: 180px;
            }
            .animal-emoji {
                font-size: 100px;
            }
            .animal-name {
                font-size: 28px;
                padding: 2px 20px;
                min-width: 100px;
            }
            .sentence-builder {
                font-size: 24px;
                padding: 12px 14px;
            }
            .sentence-builder .blank {
                min-width: 80px;
                padding: 2px 12px;
            }
            .btn {
                font-size: 18px;
                padding: 10px 20px;
            }
            .options-grid {
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 8px;
            }
            .option-btn {
                font-size: 20px;
                padding: 8px 4px;
            }
            .option-btn .opt-label {
                font-size: 15px;
            }
            .act-card .speech-bubble {
                font-size: 26px;
                padding: 12px 20px;
            }
            .act-card .speech-bubble::before {
                font-size: 24px;
                left: -28px;
            }
            .feedback {
                font-size: 20px;
                min-height: 56px;
                padding: 10px 14px;
            }
            .game-wrapper::before {
                font-size: 20px;
                top: -14px;
                letter-spacing: 10px;
                padding: 0 12px;
            }
        }

        @media (max-width: 420px) {
            .zoo-header {
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
            .score-badge {
                justify-content: center;
            }
            .category-tabs {
                gap: 6px;
            }
            .cat-btn {
                font-size: 14px;
                padding: 6px 10px;
            }
            .tab-btn {
                font-size: 14px;
                padding: 8px 10px;
                min-width: 70px;
            }
            .sentence-builder {
                font-size: 20px;
            }
            .sentence-builder .blank {
                min-width: 60px;
                font-size: 20px;
            }
            .btn {
                font-size: 16px;
                padding: 8px 16px;
            }
            .act-card .speech-bubble {
                font-size: 22px;
                padding: 10px 16px;
            }
            .animal-emoji {
                font-size: 84px;
            }
            .animal-display {
                min-height: 160px;
            }
        }`;

export default function ZooGame() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `(function() {
// ================================================================
        // DATA – CATEGORIES (expanded, properly categorized emoji sets)
        // ================================================================
        const CATEGORIES = {
            farm: {
                name: 'Farm',
                emoji: '🚜',
                animals: [
                    { emoji: '🐄', name: 'cow' },
                    { emoji: '🐖', name: 'pig' },
                    { emoji: '🐑', name: 'sheep' },
                    { emoji: '🐴', name: 'horse' },
                    { emoji: '🐔', name: 'chicken' },
                    { emoji: '🐐', name: 'goat' },
                    { emoji: '🦆', name: 'duck' },
                    { emoji: '🦃', name: 'turkey' },
                    { emoji: '🐓', name: 'rooster' },
                    { emoji: '🐰', name: 'rabbit' },
                ]
            },
            zoo: {
                name: 'Zoo',
                emoji: '🦁',
                animals: [
                    { emoji: '🦁', name: 'lion' },
                    { emoji: '🐯', name: 'tiger' },
                    { emoji: '🐘', name: 'elephant' },
                    { emoji: '🦒', name: 'giraffe' },
                    { emoji: '🐵', name: 'monkey' },
                    { emoji: '🦓', name: 'zebra' },
                    { emoji: '🦍', name: 'gorilla' },
                    { emoji: '🐼', name: 'panda' },
                    { emoji: '🦘', name: 'kangaroo' },
                    { emoji: '🦛', name: 'hippo' },
                    { emoji: '🦏', name: 'rhino' },
                    { emoji: '🐨', name: 'koala' },
                ]
            },
            sea: {
                name: 'Sea',
                emoji: '🐠',
                animals: [
                    { emoji: '🐟', name: 'fish' },
                    { emoji: '🦈', name: 'shark' },
                    { emoji: '🐋', name: 'whale' },
                    { emoji: '🐬', name: 'dolphin' },
                    { emoji: '🐙', name: 'octopus' },
                    { emoji: '🦀', name: 'crab' },
                    { emoji: '🦞', name: 'lobster' },
                    { emoji: '🦑', name: 'squid' },
                    { emoji: '🦭', name: 'seal' },
                    { emoji: '🐢', name: 'turtle' },
                ]
            }
        };

        // ================================================================
        // STATE
        // ================================================================
        let currentCategory = 'zoo';
        let categoryIndices = {
            farm: 0,
            zoo: 0,
            sea: 0
        };
        let score = 0;
        const MAX_ATTEMPTS = 3;

        // Per‑mode flags (to prevent double actions)
        let guessAttempted = false;     // true once question is fully resolved (correct or out of attempts)
        let guessAttemptsUsed = 0;
        let actDone = false;
        let lookAnswered = false;       // true once question is fully resolved
        let lookAttemptsUsed = 0;
        let guessAdvanceTimer = null;
        let lookAdvanceTimer = null;
        let actAdvanceTimer = null;

        // ================================================================
        // DOM REFS
        // ================================================================
        const $ = (id) => document.getElementById(id);
        const scoreDisplay = $('scoreDisplay');

        // Guess
        const guessEmoji = $('guessEmoji');
        const guessName = $('guessName');
        const guessOptions = $('guessOptions');
        const guessFeedback = $('guessFeedback');
        const guessAttemptsTrack = $('guessAttemptsTrack');

        // Act
        const actEmoji = $('actEmoji');
        const actName = $('actName');
        const actSentence = $('actSentence');
        const actFeedback = $('actFeedback');
        const actCheckBtn = $('actCheckBtn');

        // Look
        const lookEmoji = $('lookEmoji');
        const lookName = $('lookName');
        const lookBlank = $('lookBlank');
        const lookOptions = $('lookOptions');
        const lookFeedback = $('lookFeedback');
        const lookHintBtn = $('lookHintBtn');
        const lookAttemptsTrack = $('lookAttemptsTrack');

        // Category buttons
        const catBtns = document.querySelectorAll('.cat-btn');
        // Mode tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const panels = {
            guess: $('panel-guess'),
            act: $('panel-act'),
            look: $('panel-look'),
        };

        // ================================================================
        // HELPERS
        // ================================================================
        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function getCategoryAnimals() {
            return CATEGORIES[currentCategory].animals;
        }

        function getAnimal(index) {
            const animals = getCategoryAnimals();
            return animals[index % animals.length];
        }

        function getCurrentIndex() {
            return categoryIndices[currentCategory];
        }

        function setCurrentIndex(val) {
            categoryIndices[currentCategory] = val;
        }

        function updateScore(delta) {
            score = Math.max(0, score + delta);
            scoreDisplay.textContent = score;
        }

        // Capitalize first letter
        function cap(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Set a new emoji into an element already blurred, with no
        // transition flash of the unblurred image while it loads in.
        function setEmojiBlurred(el, emoji) {
            el.className = 'animal-emoji partial no-transition';
            el.textContent = emoji;
            // force reflow so the no-transition state is committed...
            void el.offsetWidth;
            // ...then re-enable transitions for the eventual reveal
            requestAnimationFrame(() => {
                el.classList.remove('no-transition');
            });
        }

        function updateAttemptsTrack(trackEl, used) {
            const dots = trackEl.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('used', i < used);
            });
        }

        // ================================================================
        // CATEGORY SWITCHING
        // ================================================================
        function switchCategory(catKey) {
            if (catKey === currentCategory) return;
            currentCategory = catKey;
            // Update category buttons
            catBtns.forEach(btn => {
                const isActive = btn.dataset.category === catKey;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            // Reset all modes for the new category
            initGuess();
            initAct();
            initLook();
        }

        // Category click listeners
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchCategory(btn.dataset.category);
            });
        });

        // ================================================================
        // TAB SWITCHING
        // ================================================================
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                tabBtns.forEach(b => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-selected', active ? 'true' : 'false');
                });
                Object.keys(panels).forEach(key => {
                    panels[key].classList.toggle('active', key === tab);
                });
                // Refresh the active panel (resets state if needed)
                if (tab === 'guess') initGuess();
                else if (tab === 'act') initAct();
                else if (tab === 'look') initLook();
            });
        });

        // ================================================================
        // GUESS & SAY
        // ================================================================
        function initGuess() {
            if (guessAdvanceTimer) { clearTimeout(guessAdvanceTimer); guessAdvanceTimer = null; }
            const idx = getCurrentIndex();
            const animal = getAnimal(idx);
            setEmojiBlurred(guessEmoji, animal.emoji);
            guessName.textContent = cap(animal.name);
            guessName.className = 'animal-name hidden';
            guessFeedback.textContent = '🤔 Which animal is it? Click to guess!';
            guessFeedback.className = 'feedback hint';
            guessAttempted = false;
            guessAttemptsUsed = 0;
            updateAttemptsTrack(guessAttemptsTrack, 0);
            buildGuessOptions(animal.name);
            guessOptions.classList.remove('answered');
        }

        function buildGuessOptions(correctName) {
            const animals = getCategoryAnimals();
            let pool = animals.filter(a => a.name !== correctName);
            shuffleArray(pool);
            let selected = pool.slice(0, 3);
            let options = [...selected, { emoji: getAnimal(getCurrentIndex()).emoji, name: correctName }];
            shuffleArray(options);

            guessOptions.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML =
                    \`<span class="opt-label">\${cap(opt.name)}</span>\`;
                btn.dataset.name = opt.name;
                btn.addEventListener('click', () => handleGuess(btn, correctName));
                guessOptions.appendChild(btn);
            });
        }

        function handleGuess(btn, correctName) {
            if (guessAttempted || btn.disabled) return;
            const chosen = btn.dataset.name;

            if (chosen === correctName) {
                guessAttempted = true;
                btn.disabled = true;
                btn.classList.add('selected-correct');
                guessOptions.classList.add('answered');
                document.querySelectorAll('#guessOptions .option-btn').forEach(b => b.disabled = true);
                guessFeedback.textContent = \`🎉 Correct! It's a \${cap(correctName)}!\`;
                guessFeedback.className = 'feedback correct';
                revealAnimal(guessEmoji, guessName);
                updateScore(1);
                guessAdvanceTimer = setTimeout(goNextGuess, 1800);
            } else {
                guessAttemptsUsed++;
                updateAttemptsTrack(guessAttemptsTrack, guessAttemptsUsed);
                btn.disabled = true;
                btn.classList.add('selected-wrong');

                if (guessAttemptsUsed >= MAX_ATTEMPTS) {
                    guessAttempted = true;
                    guessOptions.classList.add('answered');
                    document.querySelectorAll('#guessOptions .option-btn').forEach(b => {
                        b.disabled = true;
                        if (b.dataset.name === correctName) b.classList.add('selected-correct');
                    });
                    revealAnimal(guessEmoji, guessName);
                    guessFeedback.textContent = \`👀 It's a \${cap(correctName)}! Next time you'll get it!\`;
                    guessFeedback.className = 'feedback hint';
                    guessAdvanceTimer = setTimeout(goNextGuess, 2400);
                } else {
                    const left = MAX_ATTEMPTS - guessAttemptsUsed;
                    guessFeedback.textContent = \`❌ Not quite! \${left} \${left === 1 ? 'try' : 'tries'} left...\`;
                    guessFeedback.className = 'feedback wrong';
                }
            }
        }

        function goNextGuess() {
            if (guessAdvanceTimer) { clearTimeout(guessAdvanceTimer); guessAdvanceTimer = null; }
            let idx = getCurrentIndex() + 1;
            setCurrentIndex(idx);
            initGuess();
        }

        // ================================================================
        // ACT & SAY
        // ================================================================
        function initAct() {
            if (actAdvanceTimer) { clearTimeout(actAdvanceTimer); actAdvanceTimer = null; }
            const idx = getCurrentIndex();
            const animal = getAnimal(idx);
            setEmojiBlurred(actEmoji, animal.emoji);
            actName.textContent = cap(animal.name);
            actName.className = 'animal-name hidden';
            actSentence.textContent = \`I see a \${animal.name}.\`;
            actFeedback.textContent = \`🎭 Act like a \${animal.name}! Say: "I see a \${animal.name}."\`;
            actFeedback.className = 'feedback hint';
            actDone = false;
            actCheckBtn.disabled = false;
        }

        actCheckBtn.addEventListener('click', () => {
            if (actDone) return;
            const animal = getAnimal(getCurrentIndex());
            actDone = true;
            actCheckBtn.disabled = true;
            // reveal the animal
            revealAnimal(actEmoji, actName);
            actFeedback.textContent = \`🌟 Great job! You acted and said "I see a \${animal.name}." ⭐ +1\`;
            actFeedback.className = 'feedback correct';
            updateScore(1);
            // auto next after 2.5s
            actAdvanceTimer = setTimeout(() => {
                let idx = getCurrentIndex() + 1;
                setCurrentIndex(idx);
                initAct();
            }, 2500);
        });

        // ================================================================
        // LOOK, LISTEN & SAY
        // ================================================================
        function initLook() {
            if (lookAdvanceTimer) { clearTimeout(lookAdvanceTimer); lookAdvanceTimer = null; }
            const idx = getCurrentIndex();
            const animal = getAnimal(idx);
            setEmojiBlurred(lookEmoji, animal.emoji);
            lookName.textContent = cap(animal.name);
            lookName.className = 'animal-name hidden';
            lookBlank.textContent = '⋯';
            lookBlank.className = 'blank';
            lookBlank.dataset.correct = animal.name;
            lookAnswered = false;
            lookAttemptsUsed = 0;
            updateAttemptsTrack(lookAttemptsTrack, 0);
            lookFeedback.textContent = \`🔤 Choose the right word: "I see ___ in the zoo."\`;
            lookFeedback.className = 'feedback hint';
            lookHintBtn.disabled = false;
            buildLookOptions(animal.name);
            lookOptions.classList.remove('answered');
        }

        function buildLookOptions(correctName) {
            const animals = getCategoryAnimals();
            let pool = animals.filter(a => a.name !== correctName);
            shuffleArray(pool);
            let selected = pool.slice(0, 3);
            let options = [...selected, { emoji: getAnimal(getCurrentIndex()).emoji, name: correctName }];
            shuffleArray(options);

            lookOptions.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML =
                    \`<span class="opt-label">\${cap(opt.name)}</span>\`;
                btn.dataset.name = opt.name;
                btn.addEventListener('click', () => handleLook(btn, correctName));
                lookOptions.appendChild(btn);
            });
        }

        function handleLook(btn, correctName) {
            if (lookAnswered || btn.disabled) return;
            const chosen = btn.dataset.name;

            if (chosen === correctName) {
                lookAnswered = true;
                btn.disabled = true;
                btn.classList.add('selected-correct');
                lookOptions.classList.add('answered');
                lookHintBtn.disabled = true;
                lookBlank.textContent = cap(correctName);
                lookBlank.className = 'blank filled';
                revealAnimal(lookEmoji, lookName);
                lookFeedback.textContent = \`✅ Perfect! "I see \${correctName} in the zoo." ⭐ +1\`;
                lookFeedback.className = 'feedback correct';
                updateScore(1);
                lookAdvanceTimer = setTimeout(goNextLook, 1800);
            } else {
                lookAttemptsUsed++;
                updateAttemptsTrack(lookAttemptsTrack, lookAttemptsUsed);
                btn.disabled = true;
                btn.classList.add('selected-wrong');

                if (lookAttemptsUsed >= MAX_ATTEMPTS) {
                    lookAnswered = true;
                    lookOptions.classList.add('answered');
                    lookHintBtn.disabled = true;
                    document.querySelectorAll('#lookOptions .option-btn').forEach(b => {
                        b.disabled = true;
                        if (b.dataset.name === correctName) b.classList.add('selected-correct');
                    });
                    lookBlank.textContent = cap(correctName);
                    lookBlank.className = 'blank filled';
                    revealAnimal(lookEmoji, lookName);
                    lookFeedback.textContent = \`👀 It's "\${cap(correctName)}"! Next time you'll get it!\`;
                    lookFeedback.className = 'feedback hint';
                    lookAdvanceTimer = setTimeout(goNextLook, 2400);
                } else {
                    const left = MAX_ATTEMPTS - lookAttemptsUsed;
                    lookFeedback.textContent = \`❌ Oops! \${left} \${left === 1 ? 'try' : 'tries'} left...\`;
                    lookFeedback.className = 'feedback wrong';
                }
            }
        }

        lookHintBtn.addEventListener('click', () => {
            if (lookAnswered) return;
            const animal = getAnimal(getCurrentIndex());
            lookFeedback.textContent =
                \`💡 Hint: It starts with "\${animal.name.charAt(0).toUpperCase()}" and has \${animal.name.length} letters.\`;
            lookFeedback.className = 'feedback hint';
        });

        function goNextLook() {
            if (lookAdvanceTimer) { clearTimeout(lookAdvanceTimer); lookAdvanceTimer = null; }
            let idx = getCurrentIndex() + 1;
            setCurrentIndex(idx);
            initLook();
        }

        // ================================================================
        // REVEAL HELPER
        // ================================================================
        function revealAnimal(emojiEl, nameEl) {
            emojiEl.className = 'animal-emoji revealed';
            nameEl.className = 'animal-name';
        }

        // ================================================================
        // INITIALIZE
        // ================================================================
        function initAll() {
            // Set initial category (zoo)
            currentCategory = 'zoo';
            categoryIndices = { farm: 0, zoo: 0, sea: 0 };
            score = 0;
            scoreDisplay.textContent = '0';
            // Activate zoo category button
            catBtns.forEach(btn => {
                const isActive = btn.dataset.category === 'zoo';
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            // Init all modes
            initGuess();
            initAct();
            initLook();
            // Ensure guess tab is active
            document.querySelector('.tab-btn[data-tab="guess"]').click();
        }

        initAll();

        // ================================================================
        // KEYBOARD ACCESSIBILITY
        // ================================================================
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const active = document.activeElement;
                if (active && (active.classList.contains('tab-btn') || active.classList.contains('cat-btn'))) {
                    active.click();
                    e.preventDefault();
                }
            }
        });

        console.log('🐾 Zoo Game with categories loaded!');
})();`;
    container.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <>
      <style>{ZooGame_CSS}</style>
      <div
        ref={containerRef}
        className="zoogame-root"
        dangerouslySetInnerHTML={{ __html: ZooGame_HTML }}
      />
    </>
  );
}
