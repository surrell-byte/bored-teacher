import {
  GameDefinition
} from "./types";


const registry = new Map<string, GameDefinition>();


export function registerGame(game: GameDefinition){

  registry.set(
    game.config.id,
    game
  );

}


export function getGame(id:string){

  return registry.get(id);

}


export function getGames(){

  return Array.from(
    registry.values()
  );

}
