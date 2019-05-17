import { Display } from "rot-js";
import { screen, Screen } from "./screens";
import {
  playerActor,
  attacker,
  destructible,
  messageRecipient,
  Mixin,
  sight,
  wanderActor
} from "./mixins";
import { Map } from "./map";

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
    this.screenHeight = 28;
    this.fontSize = 20;
  }

  init = function() {
    this.display = new Display({
      width: this.screenWidth,
      height: this.screenHeight + 1,
      fontSize: this.fontSize,
      forceSquareRatio: true
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
    bindEventToScreen("keypress");
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
  getNeighborPositions = function(x: number, y: number) {
    const tiles = [];
    for (let dX = -1; dX < 2; dX++) {
      for (let dY = -1; dY < 2; dY++) {
        if (dX === 0 && dY === 0) {
          continue;
        }
        tiles.push({ x: x + dX, y: y + dY });
      }
    }
    // Todo: figure out randomize
    return tiles;
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
  sendMessage = function(recipient: Mixin, message: string) {
    if (recipient.hasMixin(messageRecipient)) {
      recipient.receiveMessage(message);
    }
  };
  sendMessageNearby = function(
    map: Map,
    centerX: number,
    centerY: number,
    centerZ: number,
    message: string
  ) {
    const entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
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
  foreground: "#60abf2",
  background: "black",
  maxHp: 1,
  attackValue: 10,
  sightRadius: 6,
  mixins: [playerActor, attacker, destructible, messageRecipient, sight],
  name: "player",
  x: 0,
  y: 0,
  z: 0
};

export const radroachTemplate = {
  name: "radroach",
  character: "r",
  foreground: "brown",
  maxHp: 10,
  movability: 0.3,
  mixins: [wanderActor, destructible, attacker]
};

export const moleratTemplate = {
  name: "molerat",
  character: "m",
  foreground: "goldenrod",
  maxHp: 20,
  attackValue: 4,
  movability: 0.8,
  mixins: [wanderActor, destructible, attacker]
};

export const superMutantTemplate = {
  name: "super mutant",
  character: "S",
  foreground: "lime",
  maxHp: 80,
  attackValue: 12,
  movability: 0.8,
  mixins: [wanderActor, destructible, attacker]
};

export const game = new Game();
game.init();
document.body.appendChild(game.getDisplay().getContainer());
game.switchScreen(screen.startScreen);
