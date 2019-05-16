import { nullTile, floorTile } from "./tile";
import { Entity } from "./entity";
import { Scheduler, Engine, FOV } from "rot-js";
import Simple from "rot-js/lib/scheduler/simple";
import { fungusTemplate } from "./main";

export class Map {
  tiles: any[];
  width: number;
  height: number;
  depth: number;
  entities: Entity[];
  scheduler: Simple;
  engine: any;
  player: Entity;
  fov: any[];
  explored: any[];
  constructor(tiles: any[], player: Entity) {
    this.tiles = tiles;
    this.depth = tiles.length;
    this.width = tiles[0].length;
    this.height = tiles[0][0].length;
    this.entities = [];
    this.scheduler = new Scheduler.Simple();
    this.fov = [];
    this.setupFov();
    this.explored = new Array(this.depth);
    this.setupExploredArray();
    this.engine = new Engine(this.scheduler);
    this.player = player;
    this.addEntityAtRandomPosition(this.player, 0);
    for (let z = 0; z < this.depth; z++) {
      for (let i = 0; i < 10; i++) {
        this.addEntityAtRandomPosition(new Entity(fungusTemplate), z);
      }
    }
  }

  getWidth = function() {
    return this.width;
  };
  getHeight = function() {
    return this.height;
  };
  getDepth = function() {
    return this.depth;
  };
  getTile = function(x: number, y: number, z: number) {
    if (
      x < 0 ||
      x >= this.width ||
      y < 0 ||
      y >= this.height ||
      z < 0 ||
      z >= this.depth
    ) {
      return nullTile;
    } else {
      return this.tiles[z][x][y] || nullTile;
    }
  };
  getRandomFloorPosition = function(z: number) {
    let x: number;
    let y: number;
    do {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.height);
    } while (this.getTile(x, y, z) !== floorTile || this.getEntityAt(x, y, z));
    return { x: x, y: y, z: z };
  };
  addEntity = function(entity: Entity) {
    if (
      entity.getX() < 0 ||
      entity.getX() > this.width ||
      entity.getY() < 0 ||
      entity.getY() > this.height ||
      entity.getZ() < 0 ||
      entity.getZ() >= this.depth
    ) {
      throw new Error("Adding entity out of bounds");
    }
    entity.setMap(this);
    this.entities.push(entity);
    if (entity.hasMixin("Actor")) {
      this.scheduler.add(entity, true);
    }
  };
  addEntityAtRandomPosition = function(entity: Entity, z: number) {
    const position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
  };
  isEmptyFloor = function(x: number, y: number, z: number) {
    return this.getTile(x, y, z) == floorTile && !this.getEntityAt(x, y, z);
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
  getEntitiesWithinRadius = function(
    centerX: number,
    centerY: number,
    centerZ: number,
    radius: number
  ) {
    const results: Entity[] = [];
    const leftX = centerX - radius;
    const rightX = centerX + radius;
    const topY = centerY - radius;
    const bottomY = centerY + radius;
    this.entities.forEach((entity: Entity) => {
      if (
        entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() >= bottomY &&
        entity.getZ() === centerZ
      ) {
        results.push(entity);
      }
    }, this);
    return results;
  };
  getEngine = function() {
    return this.engine;
  };
  getEntities = function() {
    return this.entities;
  };
  getEntityAt = function(x: number, y: number, z: number) {
    for (let i = 0; i < this.entities.length; i++) {
      if (
        this.entities[i].getX() === x &&
        this.entities[i].getY() === y &&
        this.entities[i].getZ() === z
      ) {
        return this.entities[i];
      }
    }
    return false;
  };
  setupFov = function() {
    const map = this;
    for (let z = 0; z < this.depth; z++) {
      (function() {
        let depth = z;
        map.fov.push(
          new FOV.DiscreteShadowcasting(
            function(x, y) {
              return !map.getTile(x, y, depth).getBlocksLight();
            },
            { topology: 4 }
          )
        );
      })();
    }
  };
  getFov = function(depth: number) {
    return this.fov[depth];
  };
  setupExploredArray = function() {
    for (let z = 0; z < this.depth; z++) {
      this.explored[z] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        this.explored[z][x] = new Array(this.height);
        for (let y = 0; y < this.height; y++) {
          this.explored[z][x][y] = false;
        }
      }
    }
  };
  setExplored = function(x: number, y: number, z: number) {
    if (this.getTile(x, y, z) !== nullTile) {
      return (this.explored[z][x][y] = true);
    }
    return false;
  };
  isExplored = function(x: number, y: number, z: number) {
    if (this.getTile(x, y, z) !== nullTile) {
      return this.explored[z][x][y];
    }
    return false;
  };
}
