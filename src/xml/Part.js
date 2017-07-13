import { Measure } from './Measure.js';
import { XmlObject } from './XmlObject.js';
import { Attributes } from './Attributes.js';
/**
 * Class representation of a part
 * @extends XmlObject
 */
export class Part extends XmlObject {
  /**
   * Create a part from an XML node
   * @param {NodeObject} node - the XML Node representing the part
   */
  constructor(node) {
    super(node);
    const measures = this.getChildren('measure');
    this.Measures = [];
    this.Id = parseInt(this.getAttribute('id').match(/[0-9]+/)[0], 10);

    let lastAttributes = new Attributes(this.Node.getElementsByTagName('attributes')[0]);
    let lastDivision = lastAttributes.Divisions;
    let lastMeasure = {};
    for (let m = 0; m < measures.length; m++) {
      const options = {
        lastAttributes,
        part: this.Id,
      };
      const curMeasure = new Measure(measures[m], options);
      if (m > 0) {
        // FIXME: This would overwrite all "calculated" clefs. So they need to
        // come over the constructor
        curMeasure.EndClefs = lastMeasure.EndClefs;
        curMeasure.StartClefs = lastMeasure.EndClefs;
        curMeasure.setClefs(lastMeasure.Clefs);
      }
      this.Measures.push(curMeasure);
      lastAttributes = curMeasure.Attributes; //[curMeasure.Attributes.length - 1];

      lastMeasure = curMeasure;
    }
  }

  /**
   * Get the number of all staves in all measures
   *
   * @returns {Array} Array of staves in measure
   */
  getAllStaves() {
    return this.Measures[0].getStaves();
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
