export interface GameManifest {
  id: string;
  title: string;
  description: string;

  category:
    | "Word"
    | "Math"
    | "Science"
    | "Memory"
    | "Quiz"
    | "Puzzle"
    | "Platform"
    | "Board"
    | "Sports";

  difficulty:
    | "Easy"
    | "Medium"
    | "Hard";

  thumbnail?: string;

  players: number;

  estimatedMinutes: number;

  mobile: boolean;

  keyboard: boolean;

  controller: boolean;

  version: string;

  author?: string;

  featured?: boolean;
}