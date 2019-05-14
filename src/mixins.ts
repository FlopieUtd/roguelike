import { Map } from "./map";
import { game } from "./main";
import { Entity } from "./entity";

export interface Mixin {
  [key: string]: any;
}

export const moveable = {
  name: "Moveable",
  tryMove: function(x: number, y: number, map: Map) {
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);
    if (target) {
      if (this.hasMixin("Attacker")) {
        this.attack(target);
        return true;
      } else {
        return false;
      }
    } else if (tile.getIsWalkable()) {
      this.x = x;
      this.y = y;
      return true;
    }
    return false;
  }
};

export const destructible = {
  name: "Destructible",
  init: function() {
    this.hp = 1;
  },
  takeDamage: function(attacker: Mixin, damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.getMap().removeEntity(this);
    }
  }
};

export const simpleAttacker = {
  name: "SimpleAttacker",
  groupName: "Attacker",
  attack: function(target: Mixin) {
    if (target.hasMixin("Destructible")) {
      target.takeDamage(this, 1);
    }
  }
};

export const playerActor = {
  name: "PlayerActor",
  groupName: "Actor",
  act: function() {
    game.refresh();
    this.getMap()
      .getEngine()
      .lock();
  }
};

export const fungusActor = {
  name: "FungusActor",
  groupName: "Actor",
  act: function() {}
};
