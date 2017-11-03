/* eslint-disable class-methods-use-this */

class TimeVisitor {
  visit(time) {
    return { num_beats: time.Beats, beat_value: time.BeatType, symbol: time.Symbol };
  }
}

export const timeVisitor = new TimeVisitor();
