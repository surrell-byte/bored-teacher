import type { GameInstance } from "../types";

export function createReactGame(
  component: any
): GameInstance {
  let score = 0;

  return {
    start() {
      console.log("Starting React game");
    },
    pause() {
      console.log("Pausing React game");
    },
    resume() {
      console.log("Resuming React game");
    },
    end() {
      console.log("Ending React game");
    },
    addScore(points: number) {
      score += points;
    },
    getScore() {
      return score;
    }
  };
}
