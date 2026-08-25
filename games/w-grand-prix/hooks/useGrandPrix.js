import { useCallback, useEffect, useState } from 'react';
import { drawCards } from '../game/cards';
import { calculateMove } from '../game/gameEngine';
import { EMOJIS, TURN_TIME } from '../game/constants';

export function useGrandPrix({ numPlayers, names, onComplete }) {
  const [positions, setPositions] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [cards, setCards] = useState([]);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [started, setStarted] = useState(false);

  const startGame = useCallback(() => {
    setPositions(Array(numPlayers).fill(0));
    setCurrentPlayer(0); setCards(drawCards()); setLog([]); setWinner(null);
    setAnimating(false); setTimeLeft(TURN_TIME); setStarted(true);
  }, [numPlayers]);

  const playCard = useCallback((card) => {
    if (!started || animating || winner !== null) return;
    const player = currentPlayer;
    const result = calculateMove({ position: positions[player] ?? 0, card });
    setAnimating(true);
    setPositions((previous) => previous.map((position, index) => index === player ? result.position : position));
    setLog((previous) => [`${EMOJIS[player]} ${names[player]}: ${result.messages[0]}`, ...result.messages.slice(1), ...previous].slice(0, 16));

    if (result.finished) {
      setWinner(player);
      onComplete?.(100, 100);
      setAnimating(false);
      return;
    }

    const timer = setTimeout(() => {
      setAnimating(false);
      setCurrentPlayer((previous) => (previous + 1) % numPlayers);
      setCards(drawCards());
      setTimeLeft(TURN_TIME);
    }, 700);
    return () => clearTimeout(timer);
  }, [animating, currentPlayer, names, numPlayers, onComplete, positions, started, winner]);

  useEffect(() => {
    if (!started || winner !== null || animating) return undefined;
    if (timeLeft <= 0) {
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      if (randomCard) playCard(randomCard);
      return undefined;
    }
    const timer = setTimeout(() => setTimeLeft((previous) => previous - 1), 1000);
    return () => clearTimeout(timer);
  }, [animating, cards, playCard, started, timeLeft, winner]);

  return { positions, currentPlayer, cards, log, winner, animating, timeLeft, started, startGame };
}
