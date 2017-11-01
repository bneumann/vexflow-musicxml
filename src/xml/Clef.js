import { XmlObject } from './XmlObject';

export class Clef extends XmlObject {
  constructor(node) {
    super(node);
    const staffClefNum = parseInt(this.getAttribute('number'), 10);
    this.Number = isNaN(staffClefNum) ? 1 : staffClefNum;
    this.sign = this.getText('sign');
    this.line = this.getNum('line');

    // TODO: Move somewhere else
    this.Clefs = {
      'G2': 'treble',
      'C3': 'alto',
      'G4': 'tenor',
      'F4': 'bass',
      'percussion': 'percussion',
    };
  }

  accept(visitor) {
    return visitor.visit(this);
  }

  getVexClef() {
    return this.Clefs[this.sign + this.line];
  }

  toString() {
    return `Clef [Staff ${this.Number}]:\n\t-> ${this.sign}${this.line} ~ ${this.getVexClef()}\n`;
  }
}
