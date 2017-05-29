import { XmlObject } from './XmlObject';

export class Time extends XmlObject {
  constructor(node) {
    super(node);
    this.Symbol = this.getAttribute('symbol');
    this.Beats = this.getNum('beats');
    this.BeatType = this.getNum('beat-type');
  }

  getVexTime() {
    return { num_beats: this.Beats, beat_value: this.BeatType, symbol: this.Symbol };
  }
}
