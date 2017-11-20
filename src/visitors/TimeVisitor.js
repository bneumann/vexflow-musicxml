/* eslint-disable class-methods-use-this */

/**
 * This class implements a visitor used to convert MusicXML time to VexFlow time
 */
class TimeVisitor {
  /**
   * Returns a time signature in the format used for a vexflow Time object
   * @param {Time} time XML Time object
   */
  visit(time) {
    return { num_beats: time.Beats, beat_value: time.BeatType, symbol: time.Symbol };
  }
}

export const timeVisitor = new TimeVisitor();
