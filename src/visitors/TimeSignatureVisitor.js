/* eslint-disable class-methods-use-this */

class TimeSignatureVisitor {
  visit(time) {
    return `${time.Beats}/${time.BeatType}`;
  }
}

export const timeSignatureVisitor = new TimeSignatureVisitor();
