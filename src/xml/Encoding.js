import { XmlObject } from './XmlObject';

export class Encoding extends XmlObject {
  constructor(node) {
    super(node);
    this.Software = this.getText('software');
    this.EncodingDate = this.getChild('encoding-date');
    // TODO: This is a list
    this.Supports = this.getChild('supports');
  }
}
