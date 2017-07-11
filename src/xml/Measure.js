import { XmlObject } from './XmlObject.js';
import { Attributes } from './Attributes.js';
import { Note } from './Note.js';

/**
 * Class representation of a measure
 * @extends XmlObject
 */
export class Measure extends XmlObject {
  constructor(node, options = { lastAttributes: [], part: -1 }) {
    super(node);
    const { lastAttributes, part } = options;

    this.Attributes = [];
    this.Notes = [];
    this.Part = part;

    this.Number = parseInt(this.getAttribute('number'), 10);
    this.Width = parseFloat(this.getAttribute('width'), 10);
    if (part === -1) {
      // FIXME: This is a workaround for a fluid interface. This way I can instantiate
      // new objects without parsing the node again.
      this.Attributes = lastAttributes;
      return;
    }
    const children = this.getChildren();

    // In this XML the order does matter. So we need to go through the whole
    // children and check which is which. The lastAttributes value needs to
    // be stored so the layout can break the line whereever it wants.
    let curAttributes = lastAttributes;
    this.Attributes.push(curAttributes);
    for (let ch = 0; ch < children.length; ch++) {
      const curChild = children[ch];
      if (curChild.tagName === 'note') {
        this.Notes.push(new Note(curChild, curAttributes));
      }
      if (curChild.tagName === 'attributes') {
        curAttributes = new Attributes(curChild); //Object.assign(lastAttributes, new Attributes(curChild));
        curAttributes.Divisions === undefined ? lastAttributes.Divisions : curAttributes.Divisions;
        curAttributes.Clef === undefined ? lastAttributes.Clef : curAttributes.Clef;
        this.Attributes.push(curAttributes);
      }
    }

    // Make unique list of voices in this measure
    this.Voices = [...new Set(this.Notes.map(n => n.Voice))];
  }

 /**
 * Get all the notes belonging to the given staff. The staff number
 * can be retrieved from {@link getStaves}
 * @param {Number} Number of the staff.
 * @returns {Note} A Note class object
 * @see {@link getStaves}
 */
  getNotesByStaff(index) {
    const newObj = new Measure(this.Node, { lastAttributes: this.Attributes, part: -1 });
    newObj.Notes = this.Notes.filter(a => a.Staff === index);
    return newObj;
  }

  getNotesByVoice(voice) {
    // Copy this object
    const newObj = new Measure(this.Node, { lastAttributes: this.Attributes, part: -1 });
    newObj.Notes = this.Notes.filter(n => n.Voice === voice);
    return newObj;
  }

  getAllClefs() {
    const clefs = this.Attributes.map(a => a.Clef.filter(c => c.Number));
    // Collect all distributed clefs in all attributes in measure
    return [].concat(...clefs);
  }

  getClefs() {
    return [].concat(...this.Attributes[0].Clef);
  }

  getClefsByStaff(index) {
    const clefs = this.Attributes.map(a => a.Clef.filter(c => c.Number === index));
    // Collect all distributed clefs in all attributes in measure
    return [].concat(...clefs);
    // return [...new Set(...clefs)];
  }

  getAllTimes() {
    let times = this.Attributes.map(a => a.Time);
    // Repeat the timing information according to the staves
    times = Array(this.getStaves().length).fill(times[0]);
    return times;
  }

  getTime() {
    return this.Attributes[0].Time;
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
