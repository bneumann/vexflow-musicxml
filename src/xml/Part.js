import { XmlObject } from './XmlObject.js';
import { Attributes } from './Attributes.js';
import { Measure } from './Measure.js';
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
    for (let m = 0; m < measures.length; m++) {
      const options = {
        lastAttributes,
        part: this.Id,
      };
      const curMeasure = new Measure(measures[m], options);
      if (m > 0) {
        curMeasure.lastMeasure = this.Measures[m - 1];
      }
      this.Measures.push(curMeasure);
      lastAttributes = curMeasure.Attributes;
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
   * @deprecated This function will always return all measures because all measures have attributes (with keys)
   * @returns {Key} A Key class object
   */
  getAllMeasuresWithKeys() {
    return this.Measures.filter(m => m.Attributes.Key !== undefined);
  }
}
