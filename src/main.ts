import { Display } from "rot-js";
import { screen, Screen } from "./screens";
import {
  moveable,
  playerActor,
  fungusActor,
  simpleAttacker,
  destructible
} from "./mixins";

export class Game {
  display: Display | null;
  currentScreen: Screen | null;
  screenWidth: number;
  screenHeight: number;
  fontSize: number;

  constructor() {
    this.display = null;
    this.currentScreen = null;
    this.screenWidth = 48;
    this.screenHeight = 24;
    this.fontSize = 16;
  }

  init = function() {
    this.display = new Display({
      width: this.screenWidth,
      height: this.screenHeight,
      fontSize: this.fontSize
    });
    const game = this;
    function bindEventToScreen(event: string) {
      window.addEventListener(event, function(e) {
        if (game.currentScreen !== null) {
          game.currentScreen.handleInput(event, e);
        }
      });
    }
    bindEventToScreen("keydown");
    // bindEventToScreen("keyup");
    // bindEventToScreen("keypress");
  };

  refresh = function() {
    this.display.clear();
    this.currentScreen.render(this.display);
  };

  getDisplay = function() {
    return this.display;
  };
  getScreenWidth = function() {
    return this.screenWidth;
  };
  getScreenHeight = function() {
    return this.screenHeight;
  };

  switchScreen = function(screen: Screen) {
    if (this.currentScreen) {
      this.currentScreen.exit();
    }
    this.getDisplay().clear();
    this.currentScreen = screen;
    if (!this.currentScreen !== null) {
      this.currentScreen.enter();
      this.refresh();
    }
  };
}

export const playerTemplate = {
  character: "@",
  foreground: "white",
  background: "black",
  mixins: [moveable, playerActor, simpleAttacker, destructible],
  name: "player",
  x: 0,
  y: 0
};

export const fungusTemplate = {
  character: "r",
  foreground: "goldenrod",
  mixins: [fungusActor, destructible]
};

export const game = new Game();
game.init();
document.body.appendChild(game.getDisplay().getContainer());
game.switchScreen(screen.startScreen);
