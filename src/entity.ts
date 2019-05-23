import { Glyph } from "./glyph";
import { Map } from "./map";
import { stairsUpTile, stairsDownTile } from "./tile";
import { game } from "./main";

export class Entity extends Glyph {
  name: string;
  x: number;
  y: number;
  z: number;
  map: Map | null;
  attachedMixins: object;
  attachedMixinGroups: object;
  mixins?: any[];
  constructor(props: {
    name?: string;
    x?: number;
    y?: number;
    z?: number;
    mixins: any[];
    character?: string;
    foreground?: string;
    background?: string;
    isWalkable?: boolean;
  }) {
    super(props);

    const { name, x, y, z, mixins } = props;

    this.name = name || "";
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.map = null;
    this.attachedMixins = {};
    this.attachedMixinGroups = {};
    if (mixins) {
      mixins.forEach(function(mixin) {
        for (var key in mixin) {
          if (key !== "init" && key !== "name" && !this.hasOwnProperty(key)) {
            this[key] = mixin[key];
          }
        }
        this.attachedMixins[mixin.name] = true;
        if (mixin.groupName) {
          this.attachedMixinGroups[mixin.groupName] = true;
        }
        if (mixin.init) {
          mixin.init.call(this, props);
        }
      }, this);
    }
  }
  tryMove = function(x: number, y: number, z: number) {
    const map = this.getMap();
    const tile = map.getTile(x, y, this.getZ());
    const target = map.getEntityAt(x, y, this.getZ());
    if (z < this.getZ()) {
      if (tile !== stairsUpTile) {
        game.sendMessage(this, "You can't go up here!");
      } else {
        game.sendMessage(this, `You ascend to level ${z}`);
        this.setPosition(x, y, z);
      }
    } else if (z > this.getZ()) {
      if (tile !== stairsDownTile) {
        game.sendMessage(this, "You can't go down here!");
      } else {
        game.sendMessage(this, `You descend to level ${z}`);
        this.setPosition(x, y, z);
      }
    } else if (target) {
      if (this.hasMixin("Attacker")) {
        this.attack(target);
        return true;
      } else {
        return false;
      }
    } else if (tile.getIsWalkable()) {
      this.setPosition(x, y, z);
      const items = this.getMap().getItemsAt(x, y, z);
      if (items) {
        if (items.length === 1) {
          game.sendMessage(this, `You see ${items[0].describeA()}.`);
        } else {
          game.sendMessage(this, `There are several objects here.`);
        }
      }
      return true;
    }
    return false;
  };
  setName = function(name: string) {
    this.name = name;
  };
  getName = function() {
    return this.name;
  };
  setMap = function(map: Map) {
    this.map = map;
  };
  getMap = function() {
    return this.map;
  };
  setX = function(x: number) {
    this.x = x;
  };
  getX = function() {
    return this.x;
  };
  setY = function(y: number) {
    this.y = y;
  };
  getY = function() {
    return this.y;
  };
  setZ = function(z: number) {
    this.z = z;
  };
  getZ = function() {
    return this.z || 0;
  };
  setPosition = function(x: number, y: number, z: number) {
    const oldX = this.x;
    const oldY = this.y;
    const oldZ = this.z;
    this.x = x;
    this.y = y;
    this.z = z;
    if (this.map) {
      this.map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
  };
  hasMixin = function(obj: any) {
    if (typeof obj === "object") {
      return this.attachedMixins[obj.name];
    } else {
      return this.attachedMixins[obj] || this.attachedMixinGroups[obj];
    }
  };
}
