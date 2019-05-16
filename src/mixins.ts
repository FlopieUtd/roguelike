import { Map } from "./map";
import { game } from "./main";
import { stairsUpTile, stairsDownTile } from "./tile";

export interface Mixin {
  [key: string]: any;
}

export const moveable = {
  name: "Moveable",
  tryMove: function(x: number, y: number, z: number, map: Map) {
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
      return true;
    }
    return false;
  }
};

export const destructible = {
  name: "Destructible",
  init: function(template: any) {
    const { maxHp, hp, defenseValue } = template;
    this.maxHp = maxHp || 10;
    this.hp = hp || this.maxHp;
    this.defenseValue = defenseValue || 0;
  },
  getDefenseValue: function() {
    return this.defenseValue;
  },
  getHp: function() {
    return this.hp;
  },
  getMaxHp: function() {
    return this.maxHp;
  },
  takeDamage: function(attacker: Mixin, damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      game.sendMessage(attacker, `You kill the ${this.getName()}!`);
      game.sendMessage(this, "You die!");
      this.getMap().removeEntity(this);
    }
  }
};

export const attacker = {
  name: "Attacker",
  groupName: "Attacker",
  init: function(template: any) {
    const { attackValue } = template;
    this.attackValue = attackValue || 1;
  },
  getAttackValue: function() {
    return this.attackValue;
  },
  attack: function(target: Mixin) {
    if (target.hasMixin("Destructible")) {
      const attack = this.getAttackValue();
      const defense = target.getDefenseValue();
      const max = Math.max(0, attack - defense);
      const damage = 1 + Math.floor(Math.random() * max);

      game.sendMessage(
        this,
        `You strike the ${target.getName()} for ${damage} damage!`
      );
      game.sendMessage(
        target,
        `The ${this.getName()} strikes you for ${damage} damage!`
      );

      target.takeDamage(this, damage);
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
    this.clearMessages();
  }
};

export const fungusActor = {
  name: "FungusActor",
  groupName: "Actor",
  act: function() {}
};

export const messageRecipient = {
  name: "MessageRecipient",
  init: function(template: any) {
    this.messages = [];
  },
  receiveMessage: function(message: string) {
    this.messages.push(message);
  },
  getMessages: function() {
    return this.messages;
  },
  clearMessages: function() {
    this.messages = [];
  }
};

export const sight = {
  name: "Sight",
  groupName: "Sight",
  init: function(template: any) {
    const { sightRadius } = template;
    this.sightRadius = sightRadius || 5;
  },
  getSightRadius: function() {
    return this.sightRadius;
  }
};
