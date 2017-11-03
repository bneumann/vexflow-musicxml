/* eslint-disable class-methods-use-this */
/**
* @file
* @description Visitor implementation for converting MusicXML Measure to VexFlow
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

import Vex from 'vexflow';
import { ClefVisitor, TimeSignatureVisitor } from './index';

const { Flow } = Vex;

class MeasureVisitor {
  visit(measure) {
    console.log(`Number: ${measure.Number}, ${measure.StartClefs.length}`);

    const allStaves = measure.getStaves();
    for (let s = 0; s < allStaves; s++) {
      const stave = s + 1;

      let staveClef = measure.getClefsByStaff(stave);
      if (staveClef === undefined) {
        staveClef = 'treble';
      } else {
        staveClef = staveClef.accept(ClefVisitor);
      }

      const flowStave = new Flow.Stave();

      // Adding time signatures
      if (measure.Number === 1 || measure.Attributes.TimingChange) {
        flowStave.addTimeSignature(measure.Attributes.Time.accept(TimeSignatureVisitor));
      }
    }
  }
}

export const measureVisitor = new MeasureVisitor();
