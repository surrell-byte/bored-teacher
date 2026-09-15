import FindMyFood from "@/games/find-my-food/FindMyFood";

export default function EmojiMatch({ onComplete }) {
  return <FindMyFood onComplete={onComplete} themeId="sapphire" variant="emoji" />;
}
