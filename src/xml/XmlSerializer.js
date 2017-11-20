/**
* @fileOverview
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/


export class XmlSerializer {
  /**
   * @constructor
   * @param {string} xDocString - The string representation of an XML document
   */
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
    this.xDoc = oParser.parseFromString(xDocString, 'text/xml');
  }
}
