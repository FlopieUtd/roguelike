import { Repository } from ".";
import { Item } from "../item";

export const ItemRepository = new Repository("items", Item);

ItemRepository.define("stimpak", {
  name: "stimpak",
  character: "%",
  foreground: "lightgrey"
});
