/* eslint-disable class-methods-use-this */

/**
 * This class implements a visitor used to convert MusicXML time signature to VexFlow time signature
 */
class TimeSignatureVisitor {
  /**
   * Returns a time signature in the frmat of 3/4, 4/4, ...
   * @param {Time} time XML Time object
   */
  visit(time) {
    return `${time.Beats}/${time.BeatType}`;
  }
}

export const timeSignatureVisitor = new TimeSignatureVisitor();
