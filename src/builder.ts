import { Map as RotMap } from "rot-js";
import {
  Tile,
  wallTile,
  floorTile,
  doorTile,
  stairsDownTile,
  stairsUpTile
} from "./tile";

export class Builder {
  width: number;
  height: number;
  depth: number;
  tiles: any[];
  rooms: any[];
  regions: any[];
  constructor(width: number, height: number, depth: number) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.tiles = [];
    this.rooms = [];
    this.regions = [];
    for (let z = 0; z < depth; z++) {
      this.tiles[z] = this.generateLevel();
      this.regions[z] = [];
      for (let x = 0; x < width; x++) {
        this.regions[z][x] = [];
        for (let y = 0; y < height; y++) {
          this.regions[z][x][y] = 0;
        }
      }
    }
    for (let z = 0; z < this.depth; z++) {
      this.setupRegions(z);
    }
    this.connectAllRegions();
  }

  generateLevel = () => {
    const map: Tile[][] = [];
    for (let w = 0; w < this.width; w++) {
      map.push([]);
    }
    const generator = new RotMap.Uniform(this.width, this.height, {
      roomDugPercentage: 0.15,
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
    this.rooms = generator.getRooms();
    this.rooms.forEach(room => {
      room.getDoors(drawDoor);
    });
    return map;
  };

  setupRegions = function(z: number) {
    let regionNumber = 1;
    this.rooms.forEach(
      (room: { _x1: number; _x2: number; _y1: number; _y2: number }) => {
        const xRange: number[] = [];
        const yRange: number[] = [];
        for (let i = room._x1; i <= room._x2; i++) {
          xRange.push(i);
        }
        for (let i = room._y1; i <= room._y2; i++) {
          yRange.push(i);
        }
        xRange.forEach(x => {
          yRange.forEach(y => {
            this.regions[z][x][y] = regionNumber;
          });
        });
        regionNumber++;
      }
    );
  };

  findRegionOverlaps = function(z: number, r1: number, r2: number) {
    const matches = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (
          this.tiles[z][x][y] === floorTile &&
          this.tiles[z + 1][x][y] === floorTile &&
          this.regions[z][x][y] === r1 &&
          this.regions[z + 1][x][y] === r2
        ) {
          matches.push({ x: x, y: y });
        }
      }
    }
    // Todo: figure out randomize
    return matches;
  };

  connectRegions = function(z: number, r1: number, r2: number) {
    const overlap = this.findRegionOverlaps(z, r1, r2);
    if (overlap.length === 0) {
      return false;
    }

    const point = overlap[0];
    this.tiles[z][point.x][point.y] = stairsDownTile;
    this.tiles[z + 1][point.x][point.y] = stairsUpTile;
    return true;
  };

  connectAllRegions = function() {
    for (var z = 0; z < this.depth - 1; z++) {
      const connected: { [key: string]: boolean } = {};
      let key;
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          key = this.regions[z][x][y] + "," + this.regions[z + 1][x][y];
          if (
            this.tiles[z][x][y] === floorTile &&
            this.tiles[z + 1][x][y] === floorTile &&
            !connected[key]
          ) {
            this.connectRegions(
              z,
              this.regions[z][x][y],
              this.regions[z + 1][x][y]
            );
            connected[key] = true;
          }
        }
      }
    }
  };

  getTiles = function() {
    return this.tiles;
  };

  getDepth = function() {
    return this.depth;
  };

  getWidth = function() {
    return this.width;
  };

  getHeight = function() {
    return this.height;
  };
}
