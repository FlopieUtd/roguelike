import { Color, Display, Map as RotMap } from "rot-js";
import { game, playerTemplate } from "./main";
import { Map } from "./map";
import { Entity } from "./entity";
import { Builder } from "./builder";

export interface Screen {
  map?: Map | null;
  centerX?: number;
  centerY?: number;
  player?: any;
  move?: (x: number, y: number, z: number) => void;
  enter: () => void;
  exit: () => void;
  render: (display: Display) => void;
  handleInput: (inputType: string, inputData: KeyboardEvent) => void;
}

export interface ScreenObject {
  [key: string]: Screen;
}

export const screen: ScreenObject = {
  startScreen: {
    enter: function() {
      console.info("Entered start screen");
    },
    exit: function() {
      console.info("Exited start screen");
    },
    render: function(display) {
      display.drawText(1, 1, "%c{yellow}Javascript Roguelike");
      display.drawText(1, 2, "Press [Enter] to start!");
    },
    handleInput: (inputType, inputData) => {
      if (inputType === "keydown") {
        if (inputData.code === "Enter") {
          game.switchScreen(screen.playScreen);
        }
      }
    }
  },
  playScreen: {
    map: null,
    player: null,
    move: function(dX: number, dY: number, dZ: number) {
      const newX = this.player.getX() + dX;
      const newY = this.player.getY() + dY;
      const newZ = this.player.getZ() + dZ;
      this.player.tryMove(newX, newY, newZ, this.map);
    },
    enter: function() {
      console.info("Entered play screen");
      const mapWidth = 50;
      const mapHeight = 50;
      const depth = 10;
      const tiles = new Builder(mapWidth, mapHeight, depth).getTiles();
      this.player = new Entity(playerTemplate);
      this.map = new Map(tiles, this.player);
      this.map.getEngine().start();
    },
    exit: function() {
      console.info("Exited play screen");
    },
    render: function(display) {
      const screenWidth = game.getScreenWidth();
      const screenHeight = game.getScreenHeight();
      const topLeftXTemp = Math.max(0, this.player.getX() - screenWidth / 2);
      const topLeftX = Math.min(
        topLeftXTemp,
        this.map.getWidth() - screenWidth
      );
      const topLeftYTemp = Math.max(0, this.player.getY() - screenHeight / 2);
      const topLeftY = Math.min(
        topLeftYTemp,
        this.map.getHeight() - screenHeight
      );
      const visibleCells: { [key: string]: boolean } = {};
      const currentDepth = this.player.getZ();
      const map = this.map;
      this.map
        .getFov(this.player.getZ())
        .compute(
          this.player.getX(),
          this.player.getY(),
          this.player.getSightRadius(),
          function(x: number, y: number, radius: number, visibility: any) {
            visibleCells[`${x},${y}`] = true;
            map.setExplored(x, y, currentDepth, true);
          }
        );
      for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
        for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
          if (map.isExplored(x, y, currentDepth)) {
            const tile = this.map.getTile(x, y, currentDepth);
            const foreground = visibleCells[`${x},${y}`]
              ? tile.getForeground()
              : "#032033";
            display.draw(
              x - topLeftX,
              y - topLeftY,
              tile.getCharacter(),
              foreground,
              tile.getBackground()
            );
          }
        }
      }
      const entities = this.map.getEntities();
      entities.forEach((entity: Entity) => {
        if (
          entity.getX() >= topLeftX &&
          entity.getY() >= topLeftY &&
          entity.getX() < topLeftX + screenWidth &&
          entity.getY() < topLeftY + screenHeight &&
          entity.getZ() === this.player.getZ()
        ) {
          if (visibleCells[`${entity.getX()},${entity.getY()}`]) {
            display.draw(
              entity.getX() - topLeftX,
              entity.getY() - topLeftY,
              entity.getCharacter(),
              entity.getForeground(),
              entity.getBackground()
            );
          }
        }
      });
      const messages = this.player.getMessages();
      let messageY = 0;
      messages.forEach((message: string) => {
        setTimeout(() => {
          display.drawText(0, messageY, `%c{white}%b{black}${message}`);
          messageY++;
        }, 0);
      });
      const hpStats = `%c{white}%b{black}HP: ${this.player.getHp()}/${this.player.getMaxHp()}`;
      const levelStats = `%c{white}%b{black}Level: ${this.player.getZ()}`;
      display.drawText(0, screenHeight, hpStats);
      display.drawText(screenWidth - 8, screenHeight, levelStats);
    },
    handleInput: function(inputType, inputData) {
      if (inputType === "keydown") {
        if (inputData.code === "Enter") {
          game.switchScreen(screen.winScreen);
        } else if (inputData.code === "Escape") {
          game.switchScreen(screen.loseScreen);
        } else {
          if (inputData.code === "KeyA" || inputData.code === "ArrowLeft") {
            this.move(-1, 0, 0);
          }
          if (inputData.code === "KeyD" || inputData.code === "ArrowRight") {
            this.move(1, 0, 0);
          }
          if (inputData.code === "KeyW" || inputData.code === "ArrowUp") {
            this.move(0, -1, 0);
          }
          if (inputData.code === "KeyS" || inputData.code === "ArrowDown") {
            this.move(0, 1, 0);
          }
          this.map.getEngine().unlock();
        }
      } else if (inputType === "keypress") {
        const keyChar = String.fromCharCode(inputData.charCode);
        if (keyChar === ">") {
          this.move(0, 0, 1);
        } else if (keyChar === "<") {
          this.move(0, 0, -1);
        } else {
          return;
        }
        this.map.getEngine().unlock();
      }
    }
  },
  winScreen: {
    enter: function() {
      console.info("Entered win screen");
    },
    exit: function() {
      console.info("Exited win screen");
    },
    render: display => {
      for (let i = 0; i < 22; i++) {
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);
        const background = Color.toRGB([r, g, b]);
        display.drawText(2, i + 1, "%b{" + background + "}You win!");
      }
    },
    handleInput: () => null
  },
  loseScreen: {
    enter: function() {
      console.info("Entered lose screen");
    },
    exit: function() {
      console.info("Exited lose screen");
    },
    render: display => {
      for (let i = 0; i < 22; i++) {
        display.drawText(2, i + 1, "%b{red}You lose! :(");
      }
    },
    handleInput: () => null
  }
};
