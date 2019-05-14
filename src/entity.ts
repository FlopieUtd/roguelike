import { Glyph } from "./glyph";
import { Map } from "./map";

export class Entity extends Glyph {
  name: string;
  x: number;
  y: number;
  map: Map | null;
  attachedMixins: object;
  attachedMixinGroups: object;
  mixins?: any[];
  constructor(props: {
    name?: string;
    x?: number;
    y?: number;
    mixins: any[];
    character?: string;
    foreground?: string;
    background?: string;
    isWalkable?: boolean;
  }) {
    super(props);

    const { name, x, y, mixins } = props;

    this.name = name || "";
    this.x = x || 0;
    this.y = y || 0;
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
  hasMixin = function(obj: any) {
    if (typeof obj === "object") {
      return this.attachedMixins[obj.name];
    } else {
      return this.attachedMixins[obj] || this.attachedMixinGroups[obj];
    }
  };
}
