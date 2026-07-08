import {
getGame
}
from "./GameRegistry";


export function loadGame(
id:string
){


const game=getGame(id);



if(!game){

throw new Error(
`Game ${id} not registered`
);

}



return game.create();


}