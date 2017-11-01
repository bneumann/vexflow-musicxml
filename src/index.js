import vexImport from 'vexflow';

import { MusicXmlRenderer } from './MusicXmlRenderer.js';
import { MusicXml } from './xml/MusicXml.js';
import { NoteVisitor } from './visitors/index';

// I use this to merge the existing Vex namespace with
// the additional MusicXML files.
// TODO: Ask someone if there is a better way :)
const Vex = () => {};
Vex.Flow = vexImport.Flow;

Vex.Flow.MusicXml = MusicXml;
Vex.Flow.MusicXmlRenderer = MusicXmlRenderer;
Vex.Flow.NoteVisitor = NoteVisitor;

export default Vex;
