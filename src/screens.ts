import { Color, Display, Map as RotMap } from "rot-js";
import { game, Game } from "./main";
import { playerTemplate } from "./repositories/entities";
import { Map } from "./map";
import { Entity } from "./entity";
import { Builder } from "./builder";
import { Item } from "./item";

export interface Screen {
  map?: Map | null;
  centerX?: number;
  centerY?: number;
  player?: any;
  gameOver?: boolean;
  subScreen?: any;
  move?: (x: number, y: number, z: number) => void;
  enter?: () => void;
  exit?: () => void;
  render: (display: Display) => void;
  handleInput: (inputType: string, inputData: KeyboardEvent) => void;
  setGameOver?: (gameOver: boolean) => void;
  setSubscreen?: (subScreen: any) => void;
}

export interface ScreenObject {
  [key: string]: Screen;
}

export class ItemListScreen {
  caption: string;
  onAccept?: () => void;
  canSelect: boolean;
  canSelectMultiple?: boolean;
  constructor(template: any) {
    const { caption, onAccept, canSelect, canSelectMultiple } = template;
    this.caption = caption;
    this.onAccept = onAccept;
    this.canSelect = canSelect;
    this.canSelectMultiple = canSelectMultiple;
  }
  setup = function(player: any, items: any) {
    this.player = player;
    this.items = items;
    this.selectedIndices = {};
  };

  render = function(display: Display) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    display.drawText(0, 0, this.caption);
    let row = 0;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]) {
        const letter = letters.substring(i, i + 1);
        const selectionState =
          this.canSelect && this.canSelectMultiple && this.selectedIndices[i]
            ? "+"
            : "-";
        display.drawText(
          0,
          2 + row,
          `${letter} ${selectionState} ${this.items[i].describe()}`
        );
      }
      row++;
    }
  };

  handleAccept = function() {
    const selectedItems: { [key: string]: Item } = {};
    for (let key in this.selectedIndices) {
      selectedItems[key] = this.items[key];
    }
    screen.playScreen.setSubscreen(undefined);
    if (this.onAccept(selectedItems)) {
      this.player
        .getMap()
        .getEngine()
        .unlock();
    }
  };

  handleInput = function(inputType: string, inputData: KeyboardEvent) {
    if (inputType === "keydown") {
      if (
        inputData.code === "Escape" ||
        (inputData.code === "Enter" &&
          (!this.canSelect || Object.keys(this.selectedIndices).length === 0))
      ) {
        screen.playScreen.setSubscreen(undefined);
      } else if (inputData.code === "Enter") {
        this.handleAccept();
      } else if (
        this.canSelect &&
        inputData.keyCode >= 65 &&
        inputData.keyCode <= 90
      ) {
        const index = inputData.keyCode - 65;
        if (this.items[index]) {
          if (this.canSelectMultiple) {
            if (this.selectedIndices[index]) {
              delete this.selectedIndices[index];
            } else {
              this.selectedIndices[index] = true;
            }
            game.refresh();
          } else {
            this.selectedIndices[index] = true;
            this.handleAccept();
          }
        }
      }
    }
  };
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
    gameOver: false,
    subScreen: null,
    move: function(dX: number, dY: number, dZ: number) {
      const newX = this.player.getX() + dX;
      const newY = this.player.getY() + dY;
      const newZ = this.player.getZ() + dZ;
      this.player.tryMove(newX, newY, newZ);
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
      if (this.subScreen) {
        this.subScreen.render(display);
        return;
      }
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
            let tile = this.map.getTile(x, y, currentDepth);
            let foreground = tile.getForeground();
            if (visibleCells[`${x},${y}`]) {
              const items = map.getItemsAt(x, y, currentDepth);
              if (items) {
                tile = items[items.length - 1];
              }
              if (map.getEntityAt(x, y, currentDepth)) {
                tile = map.getEntityAt(x, y, currentDepth);
              }
              foreground = tile.getForeground();
            } else {
              foreground = "#032033";
            }
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
      for (let key in entities) {
        const entity = entities[key];
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
      }
      const messages = this.player.getMessages();
      let messageY = 0;
      messages.forEach((message: string) => {
        setTimeout(() => {
          display.drawText(0, messageY, `%c{white}%b{black}${message}`);
          messageY++;
        }, 0);
      });
      const hp = this.player.getHp() > 0 ? this.player.getHp() : 0;
      const hpStats = `%c{white}%b{black}HP: ${hp}/${this.player.getMaxHp()}`;
      const levelStats = `%c{white}%b{black}Level: ${this.player.getZ()}`;
      display.drawText(0, screenHeight, hpStats);
      display.drawText(screenWidth - 8, screenHeight, levelStats);
    },
    handleInput: function(inputType, inputData) {
      if (this.gameOver) {
        if (inputType === "keydown" && inputData.keyCode === 13) {
          game.switchScreen(screen.loseScreen);
        }
        return;
      }
      if (this.subScreen) {
        this.subScreen.handleInput(inputType, inputData);
        return;
      }
      if (inputType === "keydown") {
        if (inputData.code === "Enter") {
          game.switchScreen(screen.winScreen);
        } else if (inputData.code === "Escape") {
          game.switchScreen(screen.loseScreen);
        } else {
          if (inputData.code === "ArrowLeft") {
            this.move(-1, 0, 0);
          }
          if (inputData.code === "ArrowRight") {
            this.move(1, 0, 0);
          }
          if (inputData.code === "ArrowUp") {
            this.move(0, -1, 0);
          }
          if (inputData.code === "ArrowDown") {
            this.move(0, 1, 0);
          }
          if (inputData.code === "KeyI") {
            if (!this.player.getItems().filter((x: any) => x).length) {
              game.sendMessage(this.player, "You are not carrying anything!");
              game.refresh();
            } else {
              // @ts-ignore
              screen.inventoryScreen.setup(this.player, this.player.getItems());
              this.setSubscreen(screen.inventoryScreen);
            }
            return;
          }
          if (inputData.code === "KeyD") {
            if (!this.player.getItems().filter((x: any) => x).length) {
              game.sendMessage(this.player, "You have nothing to drop!");
              game.refresh();
            } else {
              // @ts-ignore
              screen.dropScreen.setup(this.player, this.player.getItems());
              this.setSubscreen(screen.dropScreen);
            }
            return;
          }
          if (inputData.code === "Comma") {
            const items = this.map.getItemsAt(
              this.player.getX(),
              this.player.getY(),
              this.player.getZ()
            );
            if (!items) {
              game.sendMessage(this.player, "There is nothing to pick up.");
              game.refresh();
            } else if (items.length === 1) {
              const item = items[0];
              if (this.player.pickupItems([0])) {
                game.sendMessage(
                  this.player,
                  `You pick up ${item.describeA()}.`
                );
                game.refresh();
              } else {
                game.sendMessage(this.player, "Your inventory is full!");
              }
            } else {
              // @ts-ignore
              screen.pickupScreen.setup(this.player, items);
              this.setSubscreen(screen.pickupScreen);
              return;
            }

            return;
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
    },
    setGameOver: function(gameOver: boolean) {
      this.gameOver = gameOver;
    },
    setSubscreen: function(subScreen) {
      this.subScreen = subScreen;
      game.refresh();
    }
  },
  inventoryScreen: new ItemListScreen({
    caption: "Inventory",
    canSelect: false
  }),
  pickupScreen: new ItemListScreen({
    caption: "Choose the items you want to pick up.",
    canSelect: true,
    canSelectMultiple: true,
    onAccept: function(selectedItems: any) {
      if (!this.player.pickupItems(Object.keys(selectedItems))) {
        game.sendMessage(this.player, "Your inventory is full!");
      }
      return true;
    }
  }),
  dropScreen: new ItemListScreen({
    caption: "Choose the items you want to drop.",
    canSelect: true,
    canSelectMultiple: false,
    onAccept: function(selectedItems: any) {
      this.player.dropItem(Object.keys(selectedItems)[0]);
      return true;
    }
  }),
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
