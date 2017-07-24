import { XmlObject } from './XmlObject';

export class Notation extends XmlObject {
  constructor(node) {
    super(node);
    // <slur bezier-x="19" bezier-y="12" default-x="7" default-y="-11" number="1" placement="above" type="start"/>
    const slurNode = new XmlObject(node.getElementsByTagName('slur')[0]);

    this.Slur = {
      'bezier-x': slurNode.getAttribute('bezier-x'),
      'type': slurNode.getAttribute('type'),
      'number': slurNode.getAttribute('number'),
      'placement': slurNode.getAttribute('placement'),
    };
  }

  toString() {
    return this.Slur;
  }
}
