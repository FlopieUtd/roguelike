export class Repository {
  name: string;
  templates: { [key: string]: any };
  ctor: any;
  constructor(name: string, ctor: any) {
    this.name = name;
    this.templates = {};
    this.ctor = ctor;
  }

  define = function(name: string, template: any) {
    this.templates[name] = template;
  };
  create = function(name: string) {
    const template = this.templates[name];
    if (!template) {
      throw new Error(`No template named ${name} in repository ${this.name}`);
    }
    return new this.ctor(template);
  };
  createRandom = function() {
    // Find a way to randomize
    return this.create(Object.keys(this.templates));
  };
}
