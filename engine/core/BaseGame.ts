import { GameInstance, GameState } from "./types";


export abstract class BaseGame implements GameInstance {


    state: GameState = {

        score: 0,
        level: 1,
        completed: false

    };


    abstract start(): void;


    pause(): void {

        console.log("paused");

    }


    resume(): void {

        console.log("resumed");

    }


    end(): void {

        this.state.completed = true;

        console.log("finished");

    }


    addScore(points:number):void {

        this.state.score += points;

    }


    getScore():number {

        return this.state.score;

    }


}