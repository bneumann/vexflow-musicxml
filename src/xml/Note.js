import { XmlObject } from './XmlObject.js';
import { MusicXmlError } from './Errors.js';
import { Notation } from './Notation.js';

/**
 * Class representation of a Note
 * @extends XmlObject
 */
export class Note extends XmlObject {
  /**
   * Create a note from an XML node
   * @param {NodeObject} node - the XML Node representing the note
   * @param {Number}    divisions - The divisions entry from the measure node
   */
  constructor(node, attributes, clefChange) {
    super(node);

    /**
     * Private property to store attributes before this note
     * @prop {Number} Note.mAttributes
     */
    this.mAttributes = attributes;

    this.hasClefChange = clefChange;
    /**
     * Private property to store measures divions units
     * @prop {Number} Note.mDivisions
     */
    this.mDivisions = attributes.Divisions;
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
    this.Type = this.getText('type');

    /**
     * The notes stem direction (up, down)
     * @prop {String} Note.Stem
     */
    this.Stem = this.getText('stem');

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
     * Percussion notes don't have absolute values and are called "unpitched"
     * @param {Boolean} Note.isUnpitched defines if note is a percussion note
     */
    this.isUnpitched = this.childExists('unpitched');

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

  /**
   * The notes pitch. It is defined by a step and the octave.
   * @prop {Object} .Step: Step inside octave
   *                .Octave: Octave of the note
   */
  get Pitch() {
    const stepName = this.isUnpitched ? 'display-step' : 'step';
    const octaveName = this.isUnpitched ? 'display-octave' : 'octave';
    return {
      Step: this.childExists(stepName) ?  this.getText(stepName) : undefined,
      Octave: this.getNum(octaveName),
    };
  }

  get Notation() {
    return this.childExists('notations') ? new Notation(this.getChild('notations')) : null;
  }

  get IsLastSlur() {
    let res = false;
    if (this.Notation && this.Notation.Slur) {
      res = this.Notation.Slur.type === 'stop';
    }
    return res;
  }

  getAccidental() {
    const acc = this.getText('accidental');
    switch (acc) {
      case 'natural':
        return 'n';
      case 'flat':
        return 'b';
      case 'sharp':
        return '#';
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
    const ret = {
      keys: [kStep + '/' + kOctave],
      duration: type,
      stem_direction: this.Stem === 'up' ? 1 : -1,
      accidental: [this.getAccidental()],
    };
    if (this.isRest) {
      ret.type = 'r';
    }
    if (this.Node.nextElementSibling !== null) {
      const tempNote = new Note(this.Node.nextElementSibling, this.mAttributes, false);
      if (tempNote.isInChord) {
        ret.keys.push(...tempNote.getVexNote().keys);
        ret.accidental.push(...tempNote.getVexNote().accidental);
      }
    }
    return ret;
  }
}
