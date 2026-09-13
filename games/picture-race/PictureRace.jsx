import RoundChallenge from '@/games/shared/RoundChallenge';

export default function PictureRace(props) {
  return <RoundChallenge {...props} title="Picture Race" icon="🏁" prompt="Count the pictures and choose the total." variant="count" />;
}
