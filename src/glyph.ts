export class Glyph {
  character: string;
  foreground: string;
  background: string;
  isWalkable: boolean;
  blocksLight: boolean;
  constructor(props: {
    character?: string;
    foreground?: string;
    background?: string;
    isWalkable?: boolean;
    blocksLight?: boolean;
  }) {
    const {
      character,
      foreground,
      background,
      isWalkable,
      blocksLight
    } = props;
    this.character = character || "";
    this.foreground = foreground || "white";
    this.background = background || "black";
    this.isWalkable = isWalkable || false;
    this.blocksLight = !!blocksLight;
  }

  getCharacter = function() {
    return this.character;
  };

  getForeground = function() {
    return this.foreground;
  };

  getBackground = function() {
    return this.background;
  };
}
