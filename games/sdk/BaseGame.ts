import { GameState, GameInstance } from "./types";

export abstract class BaseGame implements GameInstance {
  state: GameState = {
    score: 0,
    level: 1,
    completed: false,
  };

  abstract start(): void;

  pause() {
    console.log("paused");
  }

  resume() {
    console.log("resumed");
  }

  end() {
    this.state.completed = true;
    console.log("finished");
  }

  addScore(points: number) {
    this.state.score += points;
  }

  getScore() {
    return this.state.score;
  }
}
