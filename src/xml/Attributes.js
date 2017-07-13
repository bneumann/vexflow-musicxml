import { XmlObject } from './XmlObject';
import { Clef } from './Clef.js';
import { Key } from './Key.js';
import { Time } from './Time.js';

export class Attributes extends XmlObject {
  constructor(node) {
    super(node);

    this.Divisions = isNaN(this.getNum('divisions')) ? 0 : this.getNum('divisions');
    this.Key = this.childExists('key') ? new Key(this.getChild('key')) : undefined;
    this.Staves = isNaN(this.getNum('staves')) ? 1 : this.getNum('staves');
    this.Time = this.childExists('time') ?  new Time(this.getChild('time')) : undefined;
    // this.Clef = this.childExists('clef') ?  new Clef(this.getChild('clef')) : undefined;

    const clefs = this.getChildren('clef');
    this.Clef = [...clefs].map(n => new Clef(n));
  }

  merge(attributes) {
    // Find the clef belonging to our staff and replace it
    for(const [, clef] of attributes.Clef.entries()) {
      this.Clef = this.Clef.map(c => c.Number === clef.Number ? clef : c);
    }
    this.Divisions = attributes.Divisions > 0 ? attributes.Divisions : this.Divisions;
  }

  toString() {
    return `Divisions: \n\t-> ${this.Divisions}\nTime:\n\t-> ${this.Time}\nStaves:\n\t-> ${this.Staves}\nKey:\n${this.Key}\n${this.Clef}`;
  }
}
