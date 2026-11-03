'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type GameHelpLanguage = 'off' | 'zh-CN' | 'th';

export interface GameTranslationContextValue {
  language: GameHelpLanguage;
  setLanguage: (language: GameHelpLanguage) => void;
}

const GameTranslationContext = createContext<GameTranslationContextValue>({
  language: 'off',
  setLanguage: () => {},
});

const GAME_HELP_TEXT: Record<Exclude<GameHelpLanguage, 'off'>, Record<string, string>> = {
  'zh-CN': {
    Help: '帮助',
    'Help language': '帮助语言',
    'Choose game help language': '选择游戏帮助语言',
    'Game menu': '游戏菜单',
    'Chinese help': '中文帮助',
    'Thai help': '泰语帮助',
    Sound: '声音',
    'Sound off': '声音关闭',
    'Mute sound': '静音',
    'Enable sound': '开启声音',
    On: '开启',
    Off: '关闭',
    Pause: '暂停',
    Resume: '继续',
    'Game paused': '游戏已暂停',
    'Your progress in this round is still here.': '本轮进度已保留。',
    'Resume game': '继续游戏',
    'Restart round': '重新开始本轮',
    'Leave this game?': '要离开这个游戏吗？',
    'Your current round will end and you will return to the games list.': '当前回合将结束，并返回游戏列表。',
    'Leave game': '离开游戏',
    'Keep playing': '继续游戏',
    'Exit game': '退出游戏',
    'Main menu': '主菜单',
    Theme: '主题',
    Fullscreen: '全屏',
    'Exit fullscreen': '退出全屏',
    'Full screen': '全屏',
    'Exit full screen': '退出全屏',
    Exit: '退出',
    'Choose the best answer': '选择最佳答案',
    'Choose one answer to continue.': '请选择一个答案以继续。',
    'Check answer': '检查答案',
    'Next question →': '下一题 →',
    'See my results →': '查看结果 →',
    'Start game': '开始游戏',
    'Start Game': '开始游戏',
    'Start the game': '开始游戏',
    'Start the quiz →': '开始测验 →',
    'How to play': '玩法说明',
    Instructions: '游戏说明',
    'Play again': '再玩一次',
    'Play Again': '再玩一次',
    Continue: '继续',
    'Continue →': '继续 →',
    'Back': '返回',
    'Next': '下一步',
    'Previous': '上一步',
    Score: '得分',
    Level: '关卡',
    'Game over': '游戏结束',
    'You win!': '你赢了！',
    'You won!': '你赢了！',
    Correct: '正确',
    Incorrect: '错误',
    'Who’s taking the challenge?': '谁来参加挑战？',
    'Ready,': '准备好了吗，',
    'Enter your name to personalize your Know It All game.': '输入你的名字，让《无所不知》游戏更适合你。',
    'Player 1 name': '玩家 1 的名字',
    '25 Amazing Facts': '25 个惊奇事实',
    'Curious minds welcome': '欢迎好奇的头脑',
    'How to Play 25 Amazing Facts': '如何玩 25 个惊奇事实',
    'Answer 25 multiple-choice questions about animals, space, science, geography, and history. Choose an answer to see instant feedback and an explanation, then review your results at the end.': '回答 25 道关于动物、太空、科学、地理和历史的选择题。选择答案后会立即看到反馈和解释，最后还可以查看结果。',
    Questions: '题目',
    'Choices each': '每题选项',
    'Things to learn': '有趣知识',
    'Learn with instant feedback': '通过即时反馈学习',
    'Review every answer': '查看每道题的答案',
    'Continue to main menu →': '继续前往主菜单 →',
    '1 point per correct answer': '每答对一题得 1 分',
    'Learn as you go': '边玩边学',
    'Replay any time': '随时重玩',
    'Choose the best answer for each question. Choices appear in a different order each time. You’ll get instant feedback and a quick explanation, then review your score at the end.': '每题请选择最佳答案。每次游戏的选项顺序都会改变。你会立即看到反馈和简短解释，并可在最后查看分数。',
    'Brain Power Challenge': '脑力挑战',
    'Your progress': '你的进度',
    'Question': '题目',
    'of': '/',
    'Nice work! +1 point.': '做得好！+1 分。',
    'Keep going—you can learn from every answer.': '继续努力——每个答案都能让你有所收获。',
    'That’s correct!': '答对了！',
    'Not quite.': '还差一点。',
    'How to Play': '玩法说明',
    'How To Play': '玩法说明',
    'How to Play →': '玩法说明 →',
    'How to Play Burger Run': '汉堡奔跑玩法说明',
    'Choose a mode': '选择游戏模式',
    'Back to modes': '返回模式选择',
    'Controls and card rules': '操作方式和卡牌规则',
    'Start Battle ⚔️': '开始对战 ⚔️',
    'Continue to Main Menu →': '返回主菜单 →',
    "Got It — Let's Play": '知道了，开始游戏',
    'Got it': '知道了',
    'Adventure': '冒险模式',
    'move': '移动',
    'jump (hold for higher)': '跳跃（按住跳得更高）',
    'slash enemies': '攻击敌人',
    'restart': '重新开始',
    'menu': '菜单',
    'Collect every gem to win. You have 3 hearts.': '收集所有宝石即可获胜。你有 3 颗心。',
    'Card Duel (2 players, same screen)': '卡牌对决（双人同屏）',
    'Both players start with 5 hearts and take turns.': '两位玩家各有 5 颗心，并轮流行动。',
    'On your turn, pick 1 of 4 face-down cards (click, tap or press 1–4). The cards are shuffled every turn.': '轮到你时，从 4 张盖着的卡牌中选 1 张（点击、轻触或按 1–4）。每回合卡牌都会重新洗牌。',
    '⚔️ Sword Strike — your opponent loses 2 hearts. 🔥 Fireball — your opponent loses 1 heart.': '⚔️ 剑击——对手失去 2 颗心。🔥 火球——对手失去 1 颗心。',
    '🛡️ Shield — nothing happens.': '🛡️ 护盾——不会发生任何事。',
    '💣 Bomb — it backfires, you lose a heart!': '💣 炸弹——会反噬，你失去 1 颗心！',
    'First player to reach 0 hearts loses.': '生命值先降到 0 的玩家落败。',
    'Find your seven matching tiles before your opponent.': '比对手更快找到七个与你匹配的方块。',
    'In Emoji mode, choose an emoji avatar and reveal it under the letter tiles. In Letter mode, choose a letter and reveal it under the emoji tiles. Take turns choosing tiles: finding your own target earns points and another turn; an opponent target or event tile passes play. Earn a bonus tile reveal for each 1,000 net points. Use Skip when you want to give up the turn.': '在表情符号模式中，选择一个表情头像，并在字母方块下找到它。在字母模式中，选择一个字母，并在表情符号方块下找到它。轮流选择方块：找到自己的目标即可得分并再玩一回合；找到对手的目标或事件方块则轮到对手。每净得 1,000 分，可额外翻开一个方块。不想继续时可以跳过回合。',
    'Choose your animal avatar to begin (each player picks their own).': '选择你的动物头像开始游戏（每位玩家各自选择头像）。',
    'On your turn, tap one of the four coloured cards.': '轮到你时，点击四张彩色卡牌中的一张。',
    'Watch the card flip over to reveal your move and points!': '翻开卡牌，看看你将移动几格并获得多少分！',
    'Special tiles can help or hinder you: ⭐ bonus, 🎁 treasure, 🚀 boost, 🐌 trap.': '特殊格子可能助你一臂之力，也可能阻碍你：⭐奖励、🎁宝藏、🚀加速、🐌陷阱。',
    'First animal to reach the finish tile wins!': '最先到达终点格的动物获胜！',
    'Try a quick practice round below on a mini board before the real race.': '正式比赛前，先在下方的小棋盘上快速练习一轮。',
    'Tap a card to practice!': '点击一张卡牌来练习！',
    'RED card: move forward 1': '红色卡牌：前进 1 格',
    'YELLOW card: move forward 2': '黄色卡牌：前进 2 格',
    'GREEN card: move back 1': '绿色卡牌：后退 1 格',
    'BLUE card: move forward 3': '蓝色卡牌：前进 3 格',
    "🎉 You reached the finish! That's the idea — try the real race now.": '🎉 你到达终点了！就是这样——现在试试正式比赛吧。',
    'Skip, I know how to play →': '跳过，我已经会玩了 →',
    'Red': '红色',
    'Yellow': '黄色',
    'Green': '绿色',
    'Blue': '蓝色',
    'Learn the rules and match flow.': '了解游戏规则和回合流程。',
    'Each player starts with 10 lives.': '每位玩家初始拥有 10 条命。',
    'In Roll Mode, each roll makes the parachuter lose one life.': '在掷骰模式中，每次掷骰都会让降落伞玩家失去一条命。',
    'In Card Mode, choose a hidden red, blue, green, or yellow card.': '在卡牌模式中，选择一张盖着的红、蓝、绿或黄卡牌。',
    'Cards randomly become Cut, Wind, Safe, or Wild each round.': '每回合卡牌会随机变成剪断、风力、安全或百搭效果。',
    'Players take turns flipping a tile on the board. Every tile hides one of these effects — you never know which until you flip it. Knock your opponent’s health to 0% (or have the most health left when all tiles are flipped) to win!': '玩家轮流翻开棋盘上的方块。每块下面都藏着一种效果，翻开之前无法知道是什么。将对手的生命值降到 0%，或在所有方块翻完时拥有更多生命值，即可获胜！',
    'Heavy attack −20%': '重击：造成 20% 伤害',
    'Light attack −10%': '轻击：造成 10% 伤害',
    'Lifesteal −15%/+15%': '生命偷取：对手损失 15%，自己恢复 15%',
    'Heal +20%': '治疗：恢复 20%',
    'Recover +10%': '恢复：回复 10%',
    'DEVASTATION −50%': '毁灭打击：造成 50% 伤害',
    'Two players take turns picking hidden tiles from the board. Each tile conceals a coloured block — and every colour triggers a different event. First to reach $1,000,000 wins. If the board empties first, the richer player takes the table.': '两位玩家轮流从棋盘上选择盖住的方块。每块下面藏着一个彩色方块，每种颜色都会触发不同事件。最先达到 $1,000,000 的玩家获胜。如果棋盘先被清空，则资金更多的玩家获胜。',
    'Green — Gain': '绿色 — 获得资金',
    'Bank a cash windfall of $25K–$150K. A hidden multiplier may double or triple the amount.': '获得 $25,000–$150,000。隐藏倍率可能使金额翻倍或变为三倍。',
    'Red — Loss': '红色 — 资金损失',
    'Suffer a setback of $25K–$100K, with a chance the multiplier magnifies the hit.': '损失 $25,000–$100,000，倍率还可能进一步扩大损失。',
    'Blue — Raid': '蓝色 — 突袭',
    "Steal $25K–$100K directly from your opponent's account. Blocked if they hold a Guard.": '直接从对手账户中偷取 $25,000–$100,000。如果对手持有护盾，突袭会被挡下。',
    'Yellow — Wild': '黄色 — 百搭奖励',
    'Draw a wild reward — $250K, $500K, or double your entire holdings instantly.': '获得随机奖励：$250,000、$500,000，或立即让全部资金翻倍。',
    'Purple — Guard': '紫色 — 护盾',
    'Raise a shield. Your next Raid from the opponent is automatically deflected.': '获得一面护盾，自动挡下对手下一次突袭。',
    'Black — Wild Card': '黑色 — 百搭牌',
    'Spin the wheel: Jackpot (+$300K), Inheritance (+$500K), Swap, Encore, Audit, Robbery, or Bankrupt.': '转动转盘：头奖（+$300,000）、遗产（+$500,000）、交换、再来一回合、审计、抢劫或破产。',
    'Private Table': '私人牌桌',
    '🔠 Each tile shows a letter A–Z. The letter gives no clue about the colour hidden beneath.': '🔠 每块上都标有 A–Z 字母，但字母不会提示下面藏着什么颜色。',
    '⚡ A hidden multiplier (×2 or ×3) lurks behind some tiles.': '⚡ 有些方块后藏着倍率（×2 或 ×3）。',
    '🌈 One tile is Rainbow — a special black wild card with animated colour.': '🌈 有一块是彩虹方块——一种带有彩色动画的特殊黑色百搭牌。',
    'Look at each emoji, say its name, and sort it into the matching category.': '看一看每个表情符号，说出它的名称，再把它放进对应的类别。',
    'Choose an emoji card to see which one you are sorting.': '选择一张表情符号卡，看看你要分类的是哪一个。',
    'Say the word out loud, then choose Food, Transport, Animals, or Nature.': '大声说出这个词，然后选择食物、交通工具、动物或自然类别。',
    'Sort every item correctly to finish the round. A wrong category lets you try again.': '正确分类所有项目即可完成本轮。选错类别时可以重试。',
    'Mixed rounds: Easy 3 · Medium 5 · Hard 7 items. Category levels match a larger vocabulary set to words.': '混合模式：简单 3 项、中等 5 项、困难 7 项。类别关卡会将更多词汇与单词配对。',
    'Emoji Match': '表情符号配对',
    'Find My Food': '找到我的食物',
    'Find two matching emojis in the 4 × 4 memory grid.': '在 4 × 4 记忆棋盘中找出两张相同的表情符号。',
    "Find every animal's favourite food in the 4 × 4 memory grid.": '在 4 × 4 记忆棋盘中找出每种动物最喜欢的食物。',
    'Take turns. Choose any two cards to reveal.': '轮流游戏。选择任意两张卡牌并翻开。',
    'Find a pair. Match an animal with the food it loves for 10 points. A second pair in a row earns a bonus.': '找到一对。将动物与它喜欢的食物配对可得 10 分。连续找到第二对还可获得奖励。',
    'Switch turns. After every turn, the other player chooses next.': '交换回合。每回合结束后，由另一位玩家选择。',
    'Choose pairs →': '选择配对 →',
    'Choose a mode from the main menu. In runner modes, jump over cacti and dinosaurs, duck under pterodactyls, and reach the goal.': '从主菜单选择一种模式。在跑酷模式中，跳过仙人掌和恐龙，躲开翼手龙，抵达终点。',
    'Classic Run': '经典跑酷',
    'Run solo and aim for 1,000 points. Use Space, ↑, or tap the track to jump. Hold ↓ or press the Duck button to crouch. Press R to restart.': '单人跑酷，目标是获得 1,000 分。按空格键、↑ 键或点击跑道来跳跃。按住 ↓ 键或点击蹲下按钮来下蹲。按 R 键重新开始。',
    'Solo Card Mode': '单人卡牌模式',
    'Run solo and choose one of three cards each time you reach another 200 points. Pickle Shield blocks a hit; Cheese Float changes your jumps; Lettuce Boost doubles points; Bacon Shrink makes you smaller; Honey Slow slows the run; Hot Sauce speeds it up; Mega Size makes you bigger; and Ketchup Boots weaken your jumps. Keep dodging between picks.': '单人跑酷，每增加 200 分即可从三张卡牌中选择一张。泡菜护盾可以挡下一次撞击；奶酪漂浮会改变跳跃方式；生菜加速让分数翻倍；培根缩小会让你变小；蜂蜜减速会放慢跑步速度；辣酱会加速；超大尺寸会让你变大；番茄酱靴会削弱跳跃能力。选择卡牌时也要继续躲避障碍。',
    '2P Card Duel': '双人卡牌对决',
    "Take turns picking one of four cards. Turbo moves forward 3 steps, Boost moves forward 2, Slow moves back 2, and Freeze holds position and skips that player's next turn. If both players are due to skip, each frozen turn is skipped before play resumes. First to 18 steps wins. Both burgers automatically jump cacti and dinosaurs and duck under pterodactyls; frozen burgers are safe from low-flying pterodactyls.": '轮流从四张卡牌中选一张。涡轮前进 3 步，加速前进 2 步，减速后退 2 步，冻结则停在原地并跳过该玩家下一回合。如果两位玩家都需要跳过回合，则先分别跳过冻结回合再继续游戏。最先走到 18 步的玩家获胜。两个汉堡会自动跳过仙人掌和恐龙，并躲开翼手龙；被冻结的汉堡不会被低飞的翼手龙撞到。',
    '2P Race': '双人竞速',
    'Race side by side to 1,200 points with three lives each. Player 1 uses W to jump and S to duck; Player 2 uses ↑ to jump and ↓ to duck. First to the finish wins, or the last burger standing wins if the other runs out of lives.': '并排竞速，双方各有 3 条命，目标是获得 1,200 分。玩家 1 按 W 跳跃、按 S 下蹲；玩家 2 按 ↑ 跳跃、按 ↓ 下蹲。最先抵达终点者获胜；如果对手失去所有生命，仍存活的汉堡获胜。',
    'Take turns placing your mark on empty tiles. First player to get the required number in a row — horizontally, vertically, or diagonally — wins the round.': '轮流在空格中放置自己的标记。最先在横向、纵向或斜向连成规定数量标记的玩家赢得本轮。',
    'On 3×3, get 3 in a row. On larger grids, get 4 in a row.': '在 3×3 棋盘上连成 3 个；在更大的棋盘上连成 4 个。',
    'Roll before each turn. On 1, 3, or 5, place a mark. On 2, place a mark and your opponent skips their next turn. On 4, convert an opponent tile; if there is no opponent tile yet, place a normal mark. On 6, place a mark, then roll again for an extra turn.': '每回合开始前先掷骰子。掷出 1、3 或 5 时，放置一个标记。掷出 2 时，放置一个标记并让对手跳过下一回合。掷出 4 时，将对手的格子变为自己的；如果棋盘上还没有对手的格子，则正常放置标记。掷出 6 时，放置一个标记后再掷一次，获得额外回合。',
    'Play solo against the computer. Easy = mostly random moves. Normal = blocks and seeks openings. Hard = unbeatable on 3×3, strong heuristics on larger grids.': '与电脑单人对战。简单：大多随机落子。普通：会阻挡对手并寻找机会。困难：在 3×3 棋盘上几乎无法战胜，在更大的棋盘上也会采用较强策略。',
    'Choose from 3×3 (classic, need 3), 5×5 (medium, need 4), 6×6 (large, need 4), or 7×7 (epic, need 4) in the main menu before starting.': '开始前，请在主菜单选择棋盘：3×3（经典，连成 3 个）、5×5（中等，连成 4 个）、6×6（大型，连成 4 个）或 7×7（史诗，连成 4 个）。',
    '🔢 Tap a numbered tile to reveal its hidden colour.': '🔢 点击带数字的方块，揭开隐藏的颜色。',
    '🎯 Find 5 of YOUR colour to win.': '🎯 找到 5 个属于你颜色的方块即可获胜。',
    "⚠️ Reveal your opponent's colour — they get the point!": '⚠️ 如果翻出对手的颜色，对手得分！',
    '🔥 Score 3 in a row of your colour for an extra turn!': '🔥 连续得到 3 个属于你颜色的分数，即可额外行动一次！',
    '🏆 First to 5 points wins.': '🏆 最先得到 5 分的玩家获胜。',
    '⭐ Star = Extra turn': '⭐ 星星 = 额外回合',
    '💣 Bomb = Lose 1 point': '💣 炸弹 = 失去 1 分',
    '🔄 Swap = Swap scores': '🔄 交换 = 交换分数',
    '👁️ Eye = Peek nearby (no score)': '👁️ 眼睛 = 查看附近方块（不计分）',
  },
  th: {
    Help: 'ช่วยเหลือ',
    'Help language': 'ภาษาช่วยเหลือ',
    'Choose game help language': 'เลือกภาษาช่วยเหลือของเกม',
    'Game menu': 'เมนูเกม',
    'Chinese help': 'คำแนะนำภาษาจีน',
    'Thai help': 'คำแนะนำภาษาไทย',
    Sound: 'เสียง',
    'Sound off': 'ปิดเสียง',
    'Mute sound': 'ปิดเสียง',
    'Enable sound': 'เปิดเสียง',
    On: 'เปิด',
    Off: 'ปิด',
    Pause: 'หยุดชั่วคราว',
    Resume: 'เล่นต่อ',
    'Game paused': 'หยุดเกมชั่วคราวแล้ว',
    'Your progress in this round is still here.': 'ความคืบหน้าในรอบนี้ยังคงอยู่',
    'Resume game': 'เล่นเกมต่อ',
    'Restart round': 'เริ่มรอบใหม่',
    'Leave this game?': 'ต้องการออกจากเกมนี้หรือไม่?',
    'Your current round will end and you will return to the games list.': 'รอบปัจจุบันจะสิ้นสุดและกลับไปยังรายการเกม',
    'Leave game': 'ออกจากเกม',
    'Keep playing': 'เล่นต่อ',
    'Exit game': 'ออกจากเกม',
    'Main menu': 'เมนูหลัก',
    Theme: 'ธีม',
    Fullscreen: 'เต็มหน้าจอ',
    'Exit fullscreen': 'ออกจากเต็มหน้าจอ',
    'Full screen': 'เต็มหน้าจอ',
    'Exit full screen': 'ออกจากเต็มหน้าจอ',
    Exit: 'ออก',
    'Choose the best answer': 'เลือกคำตอบที่ดีที่สุด',
    'Choose one answer to continue.': 'เลือกคำตอบหนึ่งข้อเพื่อดำเนินการต่อ',
    'Check answer': 'ตรวจคำตอบ',
    'Next question →': 'คำถามถัดไป →',
    'See my results →': 'ดูผลลัพธ์ของฉัน →',
    'Start game': 'เริ่มเกม',
    'Start Game': 'เริ่มเกม',
    'Start the game': 'เริ่มเกม',
    'Start the quiz →': 'เริ่มแบบทดสอบ →',
    'How to play': 'วิธีเล่น',
    Instructions: 'คำแนะนำ',
    'Play again': 'เล่นอีกครั้ง',
    'Play Again': 'เล่นอีกครั้ง',
    Continue: 'ดำเนินการต่อ',
    'Continue →': 'ดำเนินการต่อ →',
    Back: 'กลับ',
    Next: 'ถัดไป',
    Previous: 'ก่อนหน้า',
    Score: 'คะแนน',
    Level: 'ด่าน',
    'Game over': 'จบเกม',
    'You win!': 'คุณชนะ!',
    'You won!': 'คุณชนะ!',
    Correct: 'ถูกต้อง',
    Incorrect: 'ไม่ถูกต้อง',
    'Who’s taking the challenge?': 'ใครจะเข้าร่วมการท้าทายนี้?',
    'Ready,': 'พร้อมหรือยัง',
    'Enter your name to personalize your Know It All game.': 'กรอกชื่อเพื่อปรับแต่งเกมรอบรู้ของคุณ',
    'Player 1 name': 'ชื่อผู้เล่น 1',
    '25 Amazing Facts': '25 เรื่องน่าทึ่ง',
    'Curious minds welcome': 'ยินดีต้อนรับคนช่างสงสัย',
    'How to Play 25 Amazing Facts': 'วิธีเล่น 25 เรื่องน่าทึ่ง',
    'Answer 25 multiple-choice questions about animals, space, science, geography, and history. Choose an answer to see instant feedback and an explanation, then review your results at the end.': 'ตอบคำถามปรนัย 25 ข้อเกี่ยวกับสัตว์ อวกาศ วิทยาศาสตร์ ภูมิศาสตร์ และประวัติศาสตร์ เลือกคำตอบเพื่อดูผลตอบรับและคำอธิบายทันที จากนั้นตรวจดูผลลัพธ์เมื่อจบเกม',
    Questions: 'คำถาม',
    'Choices each': 'ตัวเลือกต่อข้อ',
    'Things to learn': 'เรื่องน่ารู้',
    'Learn with instant feedback': 'เรียนรู้จากผลตอบรับทันที',
    'Review every answer': 'ทบทวนคำตอบทุกข้อ',
    'Continue to main menu →': 'ไปยังเมนูหลัก →',
    '1 point per correct answer': 'ตอบถูกได้ 1 คะแนน',
    'Learn as you go': 'เรียนรู้ระหว่างเล่น',
    'Replay any time': 'เล่นซ้ำได้ทุกเมื่อ',
    'Choose the best answer for each question. Choices appear in a different order each time. You’ll get instant feedback and a quick explanation, then review your score at the end.': 'เลือกคำตอบที่ดีที่สุดในแต่ละข้อ ลำดับตัวเลือกจะเปลี่ยนไปทุกครั้ง คุณจะได้รับผลตอบรับและคำอธิบายสั้น ๆ ทันที แล้วตรวจดูคะแนนเมื่อจบเกม',
    'Brain Power Challenge': 'ท้าทายพลังสมอง',
    'Your progress': 'ความคืบหน้าของคุณ',
    Question: 'คำถาม',
    of: '/',
    'Nice work! +1 point.': 'ทำได้ดีมาก! +1 คะแนน',
    'Keep going—you can learn from every answer.': 'เล่นต่อไปนะ คุณเรียนรู้ได้จากทุกคำตอบ',
    'That’s correct!': 'ถูกต้อง!',
    'Not quite.': 'ยังไม่ถูกนะ',
  },
};

export function GameTranslationProvider({
  value,
  children,
}: {
  value: GameTranslationContextValue;
  children: ReactNode;
}) {
  return <GameTranslationContext.Provider value={value}>{children}</GameTranslationContext.Provider>;
}

export function useGameTranslation() {
  const context = useContext(GameTranslationContext);
  const translate = (english: string) => {
    if (context.language === 'off') return null;
    return GAME_HELP_TEXT[context.language][english.trim()] ?? null;
  };
  return { ...context, translate };
}

export function GameHelpText({
  english,
  as: Element = 'span',
  className,
  children,
}: {
  english: string;
  as?: 'span' | 'p' | 'div' | 'small';
  className?: string;
  children?: ReactNode;
}) {
  const { translate, language } = useGameTranslation();
  const translation = translate(english);
  return (
    <Element className={className}>
      {children ?? english}
      {translation && (
        <span
          className="game-help-translation"
          lang={language}
          style={{ display: 'block', marginTop: 4, color: '#3157ad', fontSize: '0.95em', fontWeight: 500, lineHeight: 1.5 }}
        >
          {translation}
        </span>
      )}
    </Element>
  );
}

export function translateGameShellText(english: string, language: GameHelpLanguage) {
  if (language === 'off') return english;
  return GAME_HELP_TEXT[language][english.trim()] ?? english;
}

export function getGameHelpTranslation(english: string, language: GameHelpLanguage) {
  if (language === 'off') return null;
  return GAME_HELP_TEXT[language][english.trim()] ?? null;
}
