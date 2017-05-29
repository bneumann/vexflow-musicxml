import { XmlObject } from './XmlObject';

export class Key extends XmlObject {
  constructor(...node) {
    super(...node);
    this.Fifths = this.getNum('fifths');
    this.Mode = this.getText('mode');
    // Default is always Major
    if (this.Mode === '') {
      this.Mode = 'major';
    }
  }
}
