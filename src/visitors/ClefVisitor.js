
/**
 * This class implements a visitor used to convert MusicXML clef to VexFlow clef
 */
class ClefVisitor {
  constructor() {
    this.Clefs = {
      'G2': 'treble',
      'C3': 'alto',
      'G4': 'tenor',
      'F4': 'bass',
      'percussion': 'percussion',
    };
  }

  /**
   * 
   * @param {Clef} clef This returns a clef in the veflow format as treble, bass, ...
   */
  visit(clef) {
    return this.Clefs[clef.sign + clef.line];
  }
}

export const clefVisitor = new ClefVisitor();
