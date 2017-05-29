import { XmlObject } from './XmlObject';
import { Encoding } from './Encoding.js';

export class Identification extends XmlObject {
  constructor(node) {
    super(node);
    this.Encoding = new Encoding(this.getChild('encoding'));
    this.Creator = this.getText('creator');
    this.CreatorType = this.getAttribute('type');
  }
}
