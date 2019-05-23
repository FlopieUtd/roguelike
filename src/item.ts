import { Glyph } from "./glyph";

export class Item extends Glyph {
  name: string;
  constructor(props: any) {
    super(props);
    const { name } = props;
    this.name = name;
  }

  describe = function() {
    return this.name;
  };

  describeA = function(capitalize: boolean) {
    const prefixes = capitalize ? ["A", "An"] : ["a", "an"];
    const string = this.describe();
    const firstLetter = string.charAt(0).toLowerCase();
    const prefix = "aeiou".indexOf(firstLetter) >= 0 ? 1 : 0;
    return `${prefixes[prefix]} ${string}`;
  };
}
