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
      game.sendMessage(attacker, "You kill the %s!", [this.getName()]);
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

      game.sendMessage(this, "You strike the %s for %d damage!", [
        target.getName(),
        damage
      ]);
      game.sendMessage(target, "The %s strikes you for %d damage!", [
        this.getName(),
        damage
      ]);

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
