export interface GameConfig {

    id:string;

    title:string;

    description?:string;

    category?:string;

    thumbnail?:string;

}


export interface GameState {

    score:number;

    level:number;

    completed:boolean;

}


export interface GameInstance {

    start():void;

    pause():void;

    resume():void;

    end():void;

    addScore(points:number):void;

    getScore():number;

}


export interface GameDefinition {

    config:GameConfig;

    create():GameInstance;

}