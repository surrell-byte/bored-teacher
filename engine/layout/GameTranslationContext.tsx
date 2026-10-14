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
}: {
  english: string;
  as?: 'span' | 'p' | 'div' | 'small';
  className?: string;
}) {
  const { translate, language } = useGameTranslation();
  const translation = translate(english);
  return (
    <Element className={className}>
      {english}
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
