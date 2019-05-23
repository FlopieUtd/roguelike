import { Map } from "./map";
import { game } from "./main";
import { stairsUpTile, stairsDownTile } from "./tile";
import { screen } from "./screens";
import { Item } from "./item";
import { ItemRepository } from "./repositories/items";

export interface Mixin {
  [key: string]: any;
}

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
      if (this.hasMixin(playerActor)) {
        this.act();
      } else {
        this.getMap().removeEntity(this);
      }
    }
  }
};

export const wanderActor = {
  name: "WanderActor",
  groupName: "Actor",
  init: function(template: any) {
    const { movability } = template;
    this.movability = movability;
  },
  getMovability: function() {
    return this.movability;
  },
  act: function() {
    if (Math.random() < this.movability) {
      const moveOffset = Math.round(Math.random()) === 1 ? 1 : -1;
      if (Math.round(Math.random()) === 1) {
        this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
      } else {
        this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
      }
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
    if (this.getHp() < 1) {
      screen.playScreen.setGameOver(true);
      game.sendMessage(this, "You have died... Press [Enter] to continue!");
    }
    game.refresh();
    this.getMap()
      .getEngine()
      .lock();
    this.clearMessages();
  }
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

export const inventoryHolder = {
  name: "InventoryHolder",
  init: function(template: any) {
    const { inventorySlots } = template;
    this.inventorySlots = inventoryHolder || 10;
    this.items = new Array(inventorySlots);
  },
  getItems: function() {
    return this.items;
  },
  getItem: function(i: number) {
    return this.items[i];
  },
  addItem: function(item: Item) {
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        this.items[i] = item;
        return true;
      }
    }
  },
  removeItem: function(i: number) {
    this.items[i] = null;
  },
  canAddItem: function() {
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        return true;
      }
    }
    return false;
  },
  pickupItems: function(indices: number[]) {
    const mapItems = this.map.getItemsAt(this.getX(), this.getY(), this.getZ());
    let added = 0;
    for (let i = 0; i < indices.length; i++) {
      if (this.addItem(mapItems[indices[i] - added])) {
        mapItems.splice(indices[i] - added, 1);
        added++;
      } else {
        break;
      }
    }
    this.map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
    return added === indices.length;
  },
  dropItem: function(i: number) {
    console.log("dropping", this.items, i, this.items[i]);
    if (this.items[i]) {
      console.log("items", this.items);
      if (this.map) {
        this.map.addItemAt(
          this.getX(),
          this.getY(),
          this.getZ(),
          this.items[i]
        );
      }
      this.removeItem(i);
    }
  }
};
