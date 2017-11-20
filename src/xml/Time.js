import { XmlObject } from './XmlObject';

export class Time extends XmlObject {
  constructor(node) {
    super(node);
    this.Symbol = this.getAttribute('symbol');
    this.Beats = this.getNum('beats');
    this.BeatType = this.getNum('beat-type');
  }

  Equals(obj2) {
    return this.Symbol === obj2.Symbol && this.Beats === obj2.Beats && this.BeatType === obj2.BeatType;
  }

  toString() {
    return `${this.Beats}/${this.BeatType}, Symbol: ${this.Symbol}`;
  }
}
