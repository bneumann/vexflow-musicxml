import { XmlObject } from './XmlObject';

export class Clef extends XmlObject {
  constructor(node) {
    super(node);
    const staffClefNum = parseInt(this.getAttribute('number'), 10);
    this.Number = Number.isNaN(staffClefNum) ? 1 : staffClefNum;
    this.sign = this.getText('sign');
    this.line = this.getNum('line');

    // TODO: Move somewhere else
    this.Clefs = {
      'G2': 'treble',
      'C3': 'alto',
      // TODO: Was this a typo? Or does a G4 exist?
      // 'G4': 'tenor',
      'C4': 'tenor',
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
    return `[Staff ${this.Number}]: ${this.sign}${this.line} ~ ${this.getVexClef()}\n`;
  }
}
