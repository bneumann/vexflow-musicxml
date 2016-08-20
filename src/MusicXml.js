// import { Vex } from 'vexflow';
import XmlObject from './XmlObject.js';

/**
* @fileOverview
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

export default class MusicXml extends XmlObject {
  constructor(xDocString) {
    // This is a hack to be able to test with mocha in a non-browser environment
    // Or maybe even in a standalone node application.
    let oParser;
    if (typeof window === 'undefined') {
      const DOMParser = require('xmldom').DOMParser; // eslint-disable-line
      oParser = new DOMParser();
    } else {
      oParser = new DOMParser();
    }
    const xDoc = oParser.parseFromString(xDocString, 'text/xml');
    super(xDoc.getElementsByTagName('score-partwise')[0]);
    this.Version = this.getAttribute('version');
    this.Identification = undefined;
    if (this.childExists('identification')) {
      this.Identification = new Identification(this.getChild('identification'));
    }
    this.Title = this.getText('movement-title');

    const parts = this.getChildren('part');
    this.Parts = [...parts].map(p => new Part(p));
  }

  getMeasuresFromPart(partNumber) {
    if (partNumber >= this.Parts.length) {
      throw new Error('The part item you are trying to get is out of bounds');
    }
    return this.Parts[partNumber].Measures;
  }
}


class Part extends XmlObject {
  constructor(node) {
    super(node);
    const measures = this.getChildren('measure');
    this.Measures = [...measures].map(m => new Measure(m));
  }

  /**
   * Get the number of all staves in all measures
   *
   * @returns {Array} Array of staves in measure
   */
  getAllStaves() {
    const staves = this.Measures.map(m => m.getStaves());
    // Concatenate all arrays to one unique set and 'cast' it to array
    return [...new Set(...staves)];
  }

  getAllClefs() {
    return this.Measures.map(m => m.getAllClefs());
  }

  /**
   * Get all the notes belonging to the given staff. The staff number
   * can be retrieved from {@link getStaves}
   * @param {Number} Number of the staff.
   * @returns {Note} A Note class object
   * @see {@link getStaves}
   */
  getNotesByStaff(index) {
    const a = [];
    this.Measures.map(key => a.push(...this.Measures[key].getNotesByStaff(index)));
    // for (var key in this.Measures) {
    //   a.push(...this.Measures[key].getNotesByStaff(index));
    // }
    return a;
  }
}

/**
 * Class representation of a measure
 * @extends XmlObject
 */
class Measure extends XmlObject {
  /**
   * Create a measure from an XML node
   * @param {NodeObject} node - the XML Node representing the measure
   */
  constructor(node) {
    super(node);
    this.Number = parseInt(this.getAttribute('number'), 10);
    this.Width = parseFloat(this.getAttribute('width'), 10);
    const attr = this.getChildren('attributes');
    // The MusicXML Spec says attributes are unbounded. It can occur that the
    // measure contains more than one node if given a "backup" node.
    this.Attributes = [...attr].map(a => new Attributes(a));
    const notes = this.getChildren('note');
    this.Notes = [...notes].map(n => new Note(n, this.Attributes ? this.Attributes.Divisions : undefined));
  }

/**
 * Get all the notes belonging to the given staff. The staff number
 * can be retrieved from {@link getStaves}
 * @param {Number} Number of the staff.
 * @returns {Note} A Note class object
 * @see {@link getStaves}
 */
  getNotesByStaff(index) {
    return [...new Set(this.Notes.filter(a => a.Staff === index))];
  }

  getNotesByBackup() {
    const bList = [];
    let nList = [];
    this.Notes.forEach(n => {
      nList.push(n);
      if (n.isLast) {
        bList.push(nList);
        nList = [];
      }
    });
    return bList;
  }

  getAllClefs() {
    const clefs = this.Attributes.map(a => a.Clef.filter(c => c.Number));
    // Collect all distributed clefs in all attributes in measure
    return [].concat(...clefs);
  }

  getClefsByStaff(index) {
    const clefs = this.Attributes.map(a => a.Clef.filter(c => c.Number === index));
    // Collect all distributed clefs in all attributes in measure
    return [].concat(...clefs);
  }

  getAllTimes() {
    let times = this.Attributes.map(a => a.Time);
    // Repeat the timing information according to the staves
    times = Array(this.getStaves().length).fill(times[0]);
    return times;
  }

/**
 * Get the numbers of all staves in this measure
 * @returns {Array} Staves in this measure
 */
  getStaves() {
    // return [...new Set(this.Notes.map(n => n.Staff))];
    const ret = [].concat(...this.Notes.map(n => n.Staff));
    return ret;
  }
}

/**
 * Class representation of a Note
 * @extends XmlObject
 */
class Note extends XmlObject {
  /**
   * Create a note from an XML node
   * @param {NodeObject} node - the XML Node representing the note
   * @param {Number}    divisions - The divisions entry from the measure node
   */
  constructor(node, divisions) {
    super(node);
    /**
     * Private property to store measures divions units
     * @prop {Number} Note.mDivisions
     */
    this.mDivisions = divisions;
    /**
     * Shows if this note is a rest
     * @prop {Boolean} Note.isRest
     */
    this.isRest = this.childExists('rest');
    /**
     * Shows if this note is part of a chord
     * @prop {Boolean} Note.isInChord
     */
    this.isInChord = this.childExists('chord');

    /**
     * Shows if this Note is before a backup element or the last in the measure
     * @prop {Boolean} Note.isLast
     */
    this.isLast = this.Node.nextElementSibling === null ||
                  this.Node.nextElementSibling === undefined ||
                  this.Node.nextElementSibling.tagName === 'backup';

    /**
     * The note's voice number
     * @prop {Number} Note.Voice
     */
    this.Voice = this.getNum('voice');
    /**
     * The note's staff number
     * @prop {Number} Note.Staff
     */
    const tStaff = this.getNum('staff');
    this.Staff = isNaN(tStaff) ? 1 : tStaff;
    /**
     * The duration of the note
     * @prop {Number} Note.Duration
     */
    this.Duration = this.getNum('duration');
    /**
     * The notes type of representation (8th, whole, ...)
     * @prop {String} Note.Type
     */
    this.Type = this.childExists('type') ?  this.getText('type') : undefined;
    /**
     * The notes beam state. It indicates if a beam starts or ends here
     * @prop {Array} Note.Beam is an array of beams. They can be 'begin', 'end',
     *               'continue' or 'none'
     */
    this.BeamState = this.getTextArray('beam');

    this.Pitch = {
      Step: this.childExists('step') ?  this.getText('step') : undefined,
      Octave: this.getNum('octave'),
    };

    /**
     * The note's length. It is defined by the duration divided by the divisions
     * in this measure.
     * @param {Number} Note.NoteLength defines the note's length
     */
    this.NoteLength = this.Duration / this.mDivisions;

    this.Dots = 0;

    // TODO: Move somewhere else
    this.Types = {
      undefined: this.calculateType(),
      'whole': 'w',
      'half': 'h',
      'quarter': 'q',
      'eighth': '8',
      '16th': '16',
      '32nd': '32',
      '64th': '64',
      '128th': '128',
      '256th': '256',
      '512th': '512',
      '1024th': '1024',
    };
  }

  calculateType() {
    let ret;

    if (this.NoteLength === 4) {
      ret = 'w';
    } else if (this.NoteLength >= 2 && this.NoteLength <= 3) {
      ret = 'h';
    } else if (this.NoteLength >= 1 && this.NoteLength < 2) {
      ret = 'w';
    }
    // TODO: Smaller then 1
    return ret;
  }

  getVexNote() {
    const kStep = this.isRest ? 'b' : this.Pitch.Step;
    const kOctave = this.isRest ? '4' : this.Pitch.Octave;
    const type = this.Types[this.Type];
    const ret = { keys: [kStep + '/' + kOctave], duration: type };
    if (this.isRest) {
      ret.type = 'r';
    }
    if (this.Node.nextElementSibling !== null) {
      const tempNote = new Note(this.Node.nextElementSibling);
      if (tempNote.isInChord) {
        ret.keys.push(...tempNote.getVexNote().keys);
      }
    }
    return ret;
  }
}

class Attributes extends XmlObject {
  constructor(node) {
    super(node);
    this.Divisions = this.getNum('divisions');
    this.Key = this.childExists('key') ? new Key(this.getChild('key')) : undefined;
    this.Staves = this.getNum('staves');
    this.Time = this.childExists('time') ?  new Time(this.getChild('time')) : undefined;
    // this.Clef = this.childExists('clef') ?  new Clef(this.getChild('clef')) : undefined;

    const clefs = this.getChildren('clef');
    this.Clef = [...clefs].map(n => new Clef(n));
  }

  getVexKey() {
    let ret;
    if (this.Key) {
      ret = this.fifthsToKey(this.Key.Fifths);
    }
    return ret;
  }

  // FIXME: This is taken from the original code and needs rework! It also includes
  // Vex as a direct dependency
  fifthsToKey(/* fifths */) {
    let ret;
    // Find equivalent key in Vex.Flow.keySignature.keySpecs
    // for (const i in Vex.Flow.keySignature.keySpecs) {
      // if ({}.hasOwnProperty.call(Vex.Flow.keySignature.keySpecs, i)) {
      //   const spec = Vex.Flow.keySignature.keySpecs[i];
      //   if (!(typeof spec !== 'object' || !('acc' in spec) || !('num' in spec))) {
      //     if ((fifths < 0 && spec.acc === 'b' && spec.num === Math.abs(fifths)) ||
      //         (fifths >= 0 && spec.acc !== 'b' && spec.num === fifths)) {
      //       return i;
      //     }
      //   }
      // }
    // }
    return ret;
  }
}

class Key extends XmlObject {
  constructor(...node) {
    super(...node);
    this.Fifths = this.getNum('fifths');
    this.Mode = this.getText('mode');
  }
}

class Time extends XmlObject {
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

class Clef extends XmlObject {
  constructor(node) {
    super(node);
    const staffClefNum = parseInt(this.getAttribute('number'), 10);
    this.Number = isNaN(staffClefNum) ? 1 : staffClefNum;
    this.sign = this.getText('sign');
    this.line = this.getNum('line');

    // TODO: Move somewhere else
    this.Clefs = {
      'G2': 'treble',
      'C3': 'alto',
      'G4': 'tenor',
      'F4': 'bass',
      'percussion': 'percussion',
    };
  }

  getVexClef() {
    return this.Clefs[this.sign + this.line];
  }
}

class Identification extends XmlObject {
  constructor(node) {
    super(node);
    this.Encoding = new Encoding(this.getChild('encoding'));
    this.Creator = this.getText('creator');
    this.CreatorType = this.getAttribute('type');
  }
}

class Encoding extends XmlObject {
  constructor(node) {
    super(node);
    this.Software = this.getText('software');
    this.EncodingDate = this.getChild('encoding-date');
    // TODO: This is a list
    this.Supports = this.getChild('supports');
  }
}
