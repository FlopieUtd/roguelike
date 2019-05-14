export class Glyph {
  character: string;
  foreground: string;
  background: string;
  isWalkable: boolean;
  constructor(props: {
    character?: string;
    foreground?: string;
    background?: string;
    isWalkable?: boolean;
  }) {
    const { character, foreground, background, isWalkable } = props;
    this.character = character || "";
    this.foreground = foreground || "white";
    this.background = background || "black";
    this.isWalkable = isWalkable || false;
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
