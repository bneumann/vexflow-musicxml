import { XmlObject } from './XmlObject';

export class Notation extends XmlObject {
  constructor(node) {
    super(node);
    let slurNode = [];
    // Fix for MusicXML 2.0: slurs are called ties here:
    const sp = node.ownerDocument.getElementsByTagName('score-partwise')[0];
    if (sp.getAttribute('version') === '2.0') {
      slurNode = node.getElementsByTagName('tied')[0];
    } else {
      slurNode = node.getElementsByTagName('slur')[0];
    }
    if (slurNode) {
      slurNode = new XmlObject(slurNode);

      this.Slur = {
        'bezier-x': slurNode.getAttribute('bezier-x'),
        'type': slurNode.getAttribute('type'),
        'number': slurNode.getAttribute('number'),
        'placement': slurNode.getAttribute('placement'),
      };
    }
  }

  toString() {
    return this.Slur;
  }
}
