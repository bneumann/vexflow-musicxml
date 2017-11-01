/**
* @file
* @description Visitor implementation for converting MusicXML to VexFlow
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

import Vex from 'vexflow';
import { Note } from '../xml/Note';
import { MusicXmlError } from '../xml/Errors.js';
import { ClefVisitor } from './index';

const { Flow } = Vex;

/**
 * This class implements a visitor used to display notes in Vex format.
 */
class NoteVisitor {
  /**
   * Returns the input required for Flow.StaveNote
   */
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
    // Add additional notes in chord
    if (this.Node.nextElementSibling !== null) {
      const tempNote = new Note(this.Node.nextElementSibling, this.mAttributes, false);
      if (tempNote.isInChord) {
        ret.keys.push(`${tempNote.Pitch.Step}/${tempNote.Pitch.Octave}`);
      }
    }
    return ret;
  }

  /**
   * Calculate the long representation type from the length of the note.
   * A length of 4 is a whole note, 2 a half and so on.
   */
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

  /**
   * Converts accidentials from MusicXML to VexFlow
   */
  getAccidental() {
    const acc = this.Accidental;
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

  /**
   * Returns the Vex type of note (whole, quarter, etc.) from it's XML representation
   */
  get Types() {
    return (
      {
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
      });
  }

  visit(note) {
    this.NoteLength = note.NoteLength;
    this.Pitch = note.Pitch;
    this.isRest = note.isRest;
    this.Node = note.Node;
    this.mAttributes = note.mAttributes;
    this.NoteLength = note.Duration / this.mAttributes.Divisions;
    this.Dots = this.NoteLength >= 1 && this.NoteLength % 1 === 0.5;
    this.Type = note.Type;
    this.Accidental = note.Accidental;

    const vNote = this.getVexNote();
    vNote.clef = note.Clef[note.Staff - 1].accept(ClefVisitor);


    const fNote = new Flow.StaveNote(vNote);

    // Add accidentials to notes
    const acc = this.getAccidental();
    if (acc) {
      fNote.addAccidental(0, new Flow.Accidental(acc));
    }

    return fNote;
  }
}

// Make it singleton
export const noteVisitor = new NoteVisitor();
