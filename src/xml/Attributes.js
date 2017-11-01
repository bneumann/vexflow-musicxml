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

    this.TimingChange = false;
    const clefs = this.getChildren('clef');
    this.Clef = [...clefs].map(n => new Clef(n));
  }

  merge(attributes) {
    // Find the clef belonging to our staff and replace it
    for (const [, clef] of attributes.Clef.entries()) {
      if (this.Clef.map(c => c.Number).indexOf(clef.Number) === -1) {
        this.Clef.push(clef);
      } else {
        this.Clef = this.Clef.map(c => c.Number === clef.Number ? c : clef);
      }
    }
    this.Divisions = attributes.Divisions > 0 ? attributes.Divisions : this.Divisions;
    this.Key = this.Key === undefined ? attributes.Key : this.Key;

    if (attributes.Time !== undefined) {
      if (this.Time === undefined) {
        this.TimingChange = false;
        this.Time = attributes.Time.clone();
      } else {
        this.TimingChange = !this.Time.Equals(attributes.Time);
      }
    }
  }

  toString() {
    return 'Divisions:' +
            `\t-> ${this.Divisions}\n` +
            'Time:' +
            `\t\t-> ${this.Time}\n` +
            'Staves:' +
            `\t\t-> ${this.Staves}\n` +
            'Key:' +
            `\t\t-> ${this.Key}\n` +
            'Clef:' +
            `\t\t-> ${this.Clef}\n`;
  }
}
