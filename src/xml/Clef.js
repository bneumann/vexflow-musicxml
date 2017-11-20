import { XmlObject } from './XmlObject';

export class Clef extends XmlObject {
  constructor(node) {
    super(node);
    const staffClefNum = parseInt(this.getAttribute('number'), 10);
    this.Number = Number.isNaN(staffClefNum) ? 1 : staffClefNum;
    this.sign = this.getText('sign');
    const lineNum = this.getNum('line');
    this.line = Number.isNaN(lineNum) ? '' : lineNum;
  }

  toString() {
    return `[Staff ${this.Number}]: ${this.sign}${this.line} ~ ${this.getVexClef()}\n`;
  }

  isEqual(clef2) {
    return this.Number === clef2.Number && this.sign === clef2.sign && this.line === clef2.line;
  }
}
