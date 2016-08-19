/**
* @fileOverview
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/


export default class XmlSerializer {
  /**
   * @constructor
   */
  constructor(xDoc) {
    const domParser = new DOMParser();
    this.xDoc = domParser.parseFromString(xDoc, 'text/xml');
  }
}
