import { XmlObject } from './XmlObject.js';
import { Attributes } from './Attributes.js';
import { Note } from './Note.js';

/**
 * Class representation of a measure
 * @extends XmlObject
 */
export class Measure extends XmlObject {
  constructor(node, lastAttributes) {
    super(node);
    this.Number = parseInt(this.getAttribute('number'), 10);
    this.Width = parseFloat(this.getAttribute('width'), 10);

    const children = this.getChildren();

    this.Attributes = [];
    this.Notes = [];

    let curAttributes = lastAttributes;
    for (let ch = 0; ch < children.length; ch++) {
      const curChild = children[ch];
      if (curChild.tagName === 'note') {
        this.Notes.push(new Note(curChild, curAttributes));
      }
      if (curChild.tagName === 'attributes') {
        curAttributes = new Attributes(curChild);
        this.Attributes.push(curAttributes);
      }
    }
    // const attr = this.getChildren('attributes');
    // // The MusicXML Spec says attributes are unbounded. It can occur that the
    // // measure contains more than one node if given a "backup" node.
    // this.Attributes = [...attr].map(a => new Attributes(a));
    // const notes = this.getChildren('note');
    // // the first attributes hould always have divisions.
    // const divisions = lastDivision === 0 ? this.Attributes[0].Divisions : lastDivision;
    // this.Notes = [...notes].map(n => new Note(n, divisions));
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
