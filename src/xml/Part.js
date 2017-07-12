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
    console.log(lastAttributes);    
    let lastDivision = lastAttributes.Divisions;
    for (let m = 0; m < measures.length; m++) {
      const options = {
        lastAttributes,
        part: this.Id,
      };
      const lastMeasure = new Measure(measures[m], options);
      this.Measures.push(lastMeasure);
      if (lastMeasure.Attributes.length > 0) {
        if (!isNaN(lastMeasure.Attributes.Divisions)) {
          lastDivision = lastMeasure.Attributes.Divisions;
        }
        // Save the divisions throughput the document
        lastMeasure.Attributes.Divisions = lastDivision;
        lastAttributes = lastMeasure.Attributes[lastMeasure.Attributes.length - 1];
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
