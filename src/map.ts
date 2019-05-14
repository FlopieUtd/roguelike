import { nullTile, floorTile } from "./tile";
import { Entity } from "./entity";
import { Scheduler, Engine } from "rot-js";
import Simple from "rot-js/lib/scheduler/simple";
import { fungusTemplate } from "./main";

export class Map {
  tiles: any[];
  width: number;
  height: number;
  entities: Entity[];
  scheduler: Simple;
  engine: any;
  player: Entity;
  constructor(tiles: any[], player: Entity) {
    this.tiles = tiles;
    this.width = tiles.length;
    this.height = tiles[0].length;
    this.entities = [];
    this.scheduler = new Scheduler.Simple();
    this.engine = new Engine(this.scheduler);
    this.player = player;
    this.addEntityAtRandomPosition(this.player);
    for (let i = 0; i < 10; i++) {
      this.addEntityAtRandomPosition(new Entity(fungusTemplate));
    }
  }

  getWidth = function() {
    return this.width;
  };
  getHeight = function() {
    return this.height;
  };
  getTile = function(x: number, y: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return nullTile;
    } else {
      return this.tiles[x][y] || nullTile;
    }
  };
  getRandomFloorPosition = function() {
    let x: number;
    let y: number;
    do {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.height);
    } while (this.getTile(x, y) !== floorTile || this.getEntityAt(x, y));
    return { x: x, y: y };
  };
  addEntity = function(entity: Entity) {
    if (
      entity.getX() < 0 ||
      entity.getX() > this.width ||
      entity.getY() < 0 ||
      entity.getY > this.height
    ) {
      throw new Error("Adding entity out of bounds");
    }
    entity.setMap(this);
    this.entities.push(entity);
    if (entity.hasMixin("Actor")) {
      this.scheduler.add(entity, true);
    }
  };
  addEntityAtRandomPosition = function(entity: Entity) {
    const position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
  };
  removeEntity = function(entity: Entity) {
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i] === entity) {
        this.entities.splice(i, 1);
        break;
      }
    }
    if (entity.hasMixin("Actor")) {
      this.scheduler.remove(entity);
    }
  };
  getEngine = function() {
    return this.engine;
  };
  getEntities = function() {
    return this.entities;
  };
  getEntityAt = function(x: number, y: number) {
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].getX() === x && this.entities[i].getY() === y) {
        return this.entities[i];
      }
    }
    return false;
  };
  isEmptyFloor = function(x: number, y: number) {
    return this.getTile(x, y) == floorTile && !this.getEntityAt(x, y);
  };
}
