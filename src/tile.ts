import { Glyph } from "./glyph";

export class Tile extends Glyph {
  props: any;
  isWalkable: boolean;
  constructor(props: any) {
    super(props);

    const { isWalkable } = props;
    this.isWalkable = isWalkable || false;
  }

  getGlyph = function() {
    return this.glyph;
  };

  getIsWalkable = function() {
    return this.isWalkable;
  };
}

export const nullTile = new Tile(new Glyph({ character: "" }));
export const floorTile = new Tile(
  new Glyph({ character: ".", isWalkable: true })
);
export const wallTile = new Tile(
  new Glyph({ character: "#", foreground: "#0c649b" })
);
export const doorTile = new Tile(
  new Glyph({ character: "#", foreground: "#0fbfa1", isWalkable: true })
);
