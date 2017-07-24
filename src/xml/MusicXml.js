// import { Vex } from 'vexflow';
import { XmlObject } from './XmlObject.js';
import { MusicXmlError } from './Errors.js';
import { Identification } from './Identification.js';
import { Part } from './Part.js';

/**
* @fileOverview
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

export class MusicXml extends XmlObject {
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
  }

  getMeasuresFromPart(partNumber) {
    if (partNumber >= this.Parts.length) {
      throw new MusicXmlError('PartOutOfBounds', 'The part item you are trying to get is out of bounds');
    }
    return this.Parts[partNumber].Measures;
  }

  getStavesPerSystem() {
    return this.Parts
      .map(p => p.getAllStaves()) // get all the staves in a part
      .reduce((e, ne) => e + ne);   // sum them up
  }

}
