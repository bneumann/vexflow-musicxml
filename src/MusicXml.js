// import { Vex } from 'vexflow';
import XmlObject from './XmlObject.js';

/**
* @fileOverview
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

export default class MusicXml extends XmlObject {
  constructor(xDocString) {
    if (xDocString === undefined) {
      super();
      throw new MusicXmlError('NoInputXML', 'No XML string has been given as input file');
    }
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
    // // FIXME: THIS IS ONLY FOR DEBUGGING!!!!
    // let rest, voice;
    // this.Parts = this.Parts.slice(0,1);
    // console.log(this.Parts);
  }

  getMeasuresFromPart(partNumber) {
    if (partNumber >= this.Parts.length) {
      throw new MusicXmlError('PartOutOfBounds', 'The part item you are trying to get is out of bounds');
    }
    return this.Parts[partNumber].Measures;
  }

}

/**
 * Class representation of a part
 * @extends XmlObject
 */
class Part extends XmlObject {
  /**
   * Create a part from an XML node
   * @param {NodeObject} node - the XML Node representing the part
   */
  constructor(node) {
    super(node);
    const measures = this.getChildren('measure');
    this.Measures = [];
    let lastDivision = 0;
    for (let m = 0; m < measures.length; m++) {
      const lastMeasure = new Measure(measures[m], lastDivision);
      this.Measures.push(lastMeasure);
      if (lastMeasure.Attributes.length > 0 && !isNaN(lastMeasure.Attributes[0].Divisions)) {
        lastDivision = lastMeasure.Attributes[0].Divisions;
      }
    }
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

  /**
   * Get all clefs in all measure
   *
   * @returns {Array} Array of clefs in all measures
   */
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

  /**
   * Gets all measures that have keys. This can be used for checking if we still
   * have the same keys as in the measure before
   * @returns {Key} A Key class object
   */
  getAllMeasuresWithKeys() {
    const a = this.Measures.filter(m => m.hasAttributes() &&
                                        m.Attributes.some(a => a.Key !== undefined));
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
   // FIXME: Description doesn't match implementation
  constructor(node, lastDivision) {
    super(node);
    this.Number = parseInt(this.getAttribute('number'), 10);
    this.Width = parseFloat(this.getAttribute('width'), 10);
    const attr = this.getChildren('attributes');
    // The MusicXML Spec says attributes are unbounded. It can occur that the
    // measure contains more than one node if given a "backup" node.
    this.Attributes = [...attr].map(a => new Attributes(a));
    const notes = this.getChildren('note');
    // the first attributes hould always have divisions.
    const divisions = lastDivision === 0 ? this.Attributes[0].Divisions : lastDivision;
    this.Notes = [...notes].map(n => new Note(n, divisions));
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
    this.Notes.forEach((n) => {
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
 * Get the unique numbers of all staves in this measure
 * @returns {Array} Staves in this measure
 */
  getStaves() {
    return [...new Set(this.Notes.map(n => n.Staff))];
  }

  /**
   * Check if this Measure has Attributes
   * @returns {Boolean} Indicates if the measure has Attributes
   */
  hasAttributes() {
    return this.Attributes !== undefined && this.Attributes.length > 0;
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


    this.hasAttributes = !(this.Node.nextElementSibling === null ||
                         this.Node.nextElementSibling === undefined ) &&
                         this.Node.nextElementSibling.tagName === 'attributes';

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
    this.Type = this.getText('type');

    /**
     * The notes beam state. It indicates if a beam starts or ends here
     * @prop {Array} Note.Beam is an array of beams. They can be 'begin', 'end',
     *               'continue' or 'none'
     */
     // FIXME: Description doesn't match implementation
    this.BeamState = this.getTextArray('beam').indexOf('begin') > -1 ||
                     this.getTextArray('beam').indexOf('continue') > -1 ||
                     this.getTextArray('beam').indexOf('end') > -1;

    /**
     * Indicates if this is the last not in a beam.
     * @prop {Boolean} Note.isLastBeamNote is an boolean that indicates the last
     * not in a beam
     */
    this.isLastBeamNote = this.getTextArray('beam').every(b => b.indexOf('end') > -1);

    /**
     * The notes pitch. It is defined by a step and the octave.
     * @prop {Object} .Step: Step inside octave
     *                .Octave: Octave of the note
     */
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

    this.Dots = this.NoteLength >= 1 && this.NoteLength % 1 === 0.5;

    // TODO: Move somewhere else
    this.Types = {
      '': this.calculateType(),
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

  getAttributes() {
    if(this.hasAttributes){
      return new Attributes(this.Node.nextElementSibling);
    }
  }

  getAccidental() {
    const acc = this.getText('accidental');
    switch (acc) {
      case "natural":
        return "n";
      case "flat":
        return "b"
      case "sharp":
        return "#";
      default:
      return null;
    }
  }

  calculateType() {
    let ret;

    if (this.NoteLength === 4) {
      ret = 'w';
    } else if (this.NoteLength >= 2 && this.NoteLength <= 3) {
      ret = 'h';
    } else if (this.NoteLength >= 1 && this.NoteLength < 2) {
      ret = 'w';
    } else if (this.NoteLength === 0.25) {
      ret = 'q';
    } else if (this.NoteLength === 0.5) {
      ret = 'h';
    } else if (this.NoteLength <= (1 / 8)) {
      ret = Math.round(1 / (1 / 8)).toString();
    }
    return ret;
  }

  getVexNote() {
    const kStep = this.isRest ? 'b' : this.Pitch.Step;
    const kOctave = this.isRest ? '4' : this.Pitch.Octave;
    const type = this.Types[this.Type];
    if (type === undefined) {
      throw new MusicXmlError('BadArguments', 'Invalid type ' + JSON.stringify(this));
    }
    const ret = { keys: [kStep + '/' + kOctave], duration: type };
    if (this.isRest) {
      ret.type = 'r';
    }
    if (this.Node.nextElementSibling !== null) {
      const tempNote = new Note(this.Node.nextElementSibling, this.mDivisions);
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
}

class Key extends XmlObject {
  constructor(...node) {
    super(...node);
    this.Fifths = this.getNum('fifths');
    this.Mode = this.getText('mode');
    // Default is always Major
    if (this.Mode === '') {
      this.Mode = 'major';
    }
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

class MusicXmlError extends TypeError {
  constructor(code, msg) {
    super();
    this.name = 'MusicXmlError:' + code;
    this.message = msg;
  }
}
