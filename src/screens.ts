import { Color, Display, Map as RotMap } from "rot-js";
import { game, playerTemplate } from "./main";
import { Map } from "./map";
import { nullTile, floorTile, wallTile, doorTile, Tile } from "./tile";
import { Entity } from "./entity";
// @ts-ignore
import { vsprintf } from "sprintf-js";

export interface Screen {
  map?: Map | null;
  centerX?: number;
  centerY?: number;
  player?: any;
  move?: (x: number, y: number) => void;
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
    move: function(x, y) {
      const newX = this.player.getX() + x;
      const newY = this.player.getY() + y;
      this.player.tryMove(newX, newY, this.map);
    },
    enter: function() {
      console.info("Entered play screen");
      const map: Tile[][] = [];
      const mapWidth = 50;
      const mapHeight = 50;
      for (let x = 0; x < mapWidth; x++) {
        map.push([]);
        for (let y = 0; y < mapHeight; y++) {
          map[x].push(nullTile);
        }
      }
      const generator = new RotMap.Uniform(mapWidth, mapHeight, {
        roomDugPercentage: 0.9,
        roomWidth: [5, 10],
        roomHeight: [5, 10]
      });
      generator.create(function(x, y, v) {
        if (v === 1) {
          map[x][y] = wallTile;
        } else {
          map[x][y] = floorTile;
        }
      });
      const drawDoor = function(x: number, y: number) {
        map[x][y] = doorTile;
      };
      const rooms = generator.getRooms();
      rooms.forEach(room => {
        room.getDoors(drawDoor);
      });
      this.player = new Entity(playerTemplate);
      this.map = new Map(map, this.player);
      this.map.getEngine().start();
    },
    exit: function() {
      console.info("Exited play screen");
    },
    render: function(display) {
      const screenWidth = game.getScreenWidth();
      const screenHeight = game.getScreenHeight();
      let topLeftX = Math.max(0, this.player.getX() - screenWidth / 2);
      const topLeftY = Math.max(0, this.player.getY() - screenHeight / 2);
      for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
        for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
          const tile = this.map.getTile(x, y);
          display.draw(
            x - topLeftX,
            y - topLeftY,
            tile.getCharacter(),
            tile.getForeground(),
            tile.getBackground()
          );
        }
      }
      const entities = this.map.getEntities();
      entities.forEach((entity: Entity) => {
        if (
          entity.getX() >= topLeftX &&
          entity.getY() >= topLeftY &&
          entity.getX() < topLeftX + screenWidth &&
          entity.getY() < topLeftY + screenHeight
        ) {
          display.draw(
            entity.getX() - topLeftX,
            entity.getY() - topLeftY,
            entity.getCharacter(),
            entity.getForeground(),
            entity.getBackground()
          );
        }
      });
      const messages = this.player.getMessages();
      let messageY = 0;
      messages.forEach((message: string) => {
        setTimeout(() => {
          display.drawText(0, messageY, "%c{white}%b{black}" + message);
          messageY++;
        }, 0);
      });
      const stats = `%c{white}%b{black}HP: ${this.player.getHp()}/${this.player.getMaxHp()}`;
      display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
      if (inputType === "keydown") {
        if (inputData.code === "Enter") {
          game.switchScreen(screen.winScreen);
        } else if (inputData.code === "Escape") {
          game.switchScreen(screen.loseScreen);
        } else {
          if (inputData.code === "KeyA" || inputData.code === "ArrowLeft") {
            this.move(-1, 0);
          }
          if (inputData.code === "KeyD" || inputData.code === "ArrowRight") {
            this.move(1, 0);
          }
          if (inputData.code === "KeyW" || inputData.code === "ArrowUp") {
            this.move(0, -1);
          }
          if (inputData.code === "KeyS" || inputData.code === "ArrowDown") {
            this.move(0, 1);
          }
          this.map.getEngine().unlock();
          game.refresh();
        }
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
