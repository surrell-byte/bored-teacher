import { registerGame } from "@/engine/core/GameRegistry";
import { createReactGame } from "@/engine/core/adapters/ReactGameAdapter";


import MyFirstSDKGame from "./my-first-sdk-game";
import MemoryGame from "./memory-game";
import ColourClash from "./colour-clash";


registerGame({

  config: MyFirstSDKGame.config,

  create(){
    return createReactGame(
      MyFirstSDKGame.component
    );
  }

});


registerGame({

  config: MemoryGame.config,

  create(){
    return createReactGame(
      MemoryGame.component
    );
  }

});


registerGame({

  config: ColourClash.config,

  create(){
    return createReactGame(
      ColourClash.component
    );
  }

});
