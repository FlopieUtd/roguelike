import { Glyph } from "./glyph";

export class Tile extends Glyph {
  props: any;
  isWalkable: boolean;
  blocksLight: boolean;
  constructor(props: any) {
    super(props);

    const { isWalkable, blocksLight } = props;
    this.isWalkable = isWalkable || false;
    this.blocksLight = !!blocksLight;
  }

  getGlyph = function() {
    return this.glyph;
  };

  getIsWalkable = function() {
    return this.isWalkable;
  };

  getBlocksLight = function() {
    return this.blocksLight;
  };
}

export const nullTile = new Tile(new Glyph({ character: "" }));
export const floorTile = new Tile(
  new Glyph({ character: ".", isWalkable: true, blocksLight: false })
);
export const wallTile = new Tile(
  new Glyph({
    character: "#",
    foreground: "#063554",
    background: "#02131e",
    blocksLight: true
  })
);
export const stairsUpTile = new Tile(
  new Glyph({
    character: "<",
    foreground: "white",
    isWalkable: true,
    blocksLight: false
  })
);
export const stairsDownTile = new Tile(
  new Glyph({
    character: ">",
    foreground: "white",
    isWalkable: true,
    blocksLight: false
  })
);
