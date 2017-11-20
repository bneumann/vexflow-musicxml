import Vex from 'vexflow';

const { Flow } = Vex;

/**
 * This class implements a visitor used to convert MusicXML keys to VexFlow keys
 */
class KeyVisitor {
  /**
  *
  * From the docs:
  * Traditional key signatures are represented by the number
  * of flats and sharps, plus an optional mode for major/
  * minor/mode distinctions. Negative numbers are used for
  * flats and positive numbers for sharps, reflecting the
  * key's placement within the circle of fifths (hence the
  * element name).
  * @param {xmlKey} Key MusicXml object to be translated
  * @returns {VexKey} Vex object
  */
  constructor() {
    this.keySpec = [];
    // Create a lookup table of key names ("C", "B", etc.) that map to key objects
    for (const k in Flow.keySignature.keySpecs) {
      if ({}.hasOwnProperty.call(Flow.keySignature.keySpecs, k)) {
        const newEntry = Flow.keySignature.keySpecs[k];
        newEntry.name = k;
        this.keySpec.push(newEntry);
      }
    }
  }

  visit(key) {
    this.xmlKey = key;
    let filteredKeys = this.keySpec.filter(k => k.num === Math.abs(this.xmlKey.Fifths));
    const mode = this.xmlKey.Mode === 'major' ? 0 : 1;
    if (this.xmlKey.Fifth < 0) {
      filteredKeys = filteredKeys.filter(k => k.acc === 'b');
    } else if (this.xmlKey.Fifths > 0) {
      filteredKeys = filteredKeys.filter(k => k.acc === '#');
    }
    const entry = filteredKeys[mode].name;
    return entry;
  }
}

export const keyVisitor = new KeyVisitor();
