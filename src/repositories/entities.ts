import {
  playerActor,
  attacker,
  destructible,
  messageRecipient,
  sight,
  wanderActor,
  inventoryHolder
} from "../mixins";
import { Repository } from ".";
import { Entity } from "../entity";

export const playerTemplate = {
  character: "@",
  foreground: "#60abf2",
  background: "black",
  maxHp: 40,
  attackValue: 10,
  sightRadius: 6,
  inventorySlots: 4,
  mixins: [
    playerActor,
    attacker,
    destructible,
    messageRecipient,
    sight,
    inventoryHolder
  ],
  name: "player",
  x: 0,
  y: 0,
  z: 0
};

export const EntityRepository = new Repository("entities", Entity);

EntityRepository.define("radroach", {
  name: "radroach",
  character: "r",
  foreground: "brown",
  maxHp: 10,
  movability: 0.3,
  mixins: [wanderActor, destructible, attacker]
});

EntityRepository.define("molerat", {
  name: "molerat",
  character: "m",
  foreground: "goldenrod",
  maxHp: 20,
  attackValue: 4,
  movability: 0.8,
  mixins: [wanderActor, destructible, attacker]
});

EntityRepository.define("super mutant", {
  name: "super mutant",
  character: "S",
  foreground: "lime",
  maxHp: 60,
  attackValue: 12,
  movability: 0.8,
  mixins: [wanderActor, destructible, attacker]
});
