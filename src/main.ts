import { Display } from "rot-js";
import { screen, Screen } from "./screens";
import {
  moveable,
  playerActor,
  fungusActor,
  attacker,
  destructible,
  messageRecipient,
  Mixin
} from "./mixins";
// @ts-ignore
import { vsprintf } from "sprintf-js";
import { Map } from "./map";
import { Entity } from "./entity";

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
      height: this.screenHeight + 1,
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
  sendMessage = function(recipient: Mixin, message: string, args?: string[]) {
    if (recipient.hasMixin(messageRecipient)) {
      if (args) {
        message = vsprintf(message, args);
      }
      recipient.receiveMessage(message);
    }
  };
  sendMessageNearby = function(
    map: Map,
    centerX: number,
    centerY: number,
    message: string,
    args: string[]
  ) {
    if (args) {
      message = vsprintf(message, args);
    }
    const entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
    entities.forEach(entity => {
      if (entity.hasMixin(messageRecipient)) {
        // @ts-ignore
        entity.receiveMessage(message);
      }
    });
  };
}

export const playerTemplate = {
  character: "@",
  foreground: "white",
  background: "black",
  maxHp: 40,
  attackValue: 10,
  mixins: [moveable, playerActor, attacker, destructible, messageRecipient],
  name: "player",
  x: 0,
  y: 0
};

export const fungusTemplate = {
  name: "radroach",
  character: "r",
  foreground: "goldenrod",
  maxHp: 10,
  mixins: [fungusActor, destructible]
};

export const game = new Game();
game.init();
document.body.appendChild(game.getDisplay().getContainer());
game.switchScreen(screen.startScreen);
