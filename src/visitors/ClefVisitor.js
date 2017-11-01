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

  getVexClef(clef) {
    return this.Clefs[clef.sign + clef.line];
  }

  visit(clef) {
    this.Clefs = {
      'G2': 'treble',
      'C3': 'alto',
      'G4': 'tenor',
      'F4': 'bass',
      'percussion': 'percussion',
    };
    return this.getVexClef(clef);
  }
}

export const clefVisitor = new ClefVisitor();
