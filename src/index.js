import vexImport from 'vexflow';

import { VexRenderer } from './VexRenderer.js';
import { MusicXml } from './xml/MusicXml.js';

// I use this to merge the existing Vex namespace with
// the additional MusicXML files.
// TODO: Ask someone if there is a better way :)
const Vex = () => {};
Vex.Flow = vexImport.Flow;

Vex.Flow.MusicXml = MusicXml;
Vex.Flow.MusicXmlRenderer = VexRenderer;

export default Vex;
