/**
 * @file
 * @description Visitor implementation for converting MusicXML Measure to VexFlow
 * @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
 * @version 0.1
 */

/* eslint-disable class-methods-use-this */

import Vex from 'vexflow';
import { ClefVisitor, KeyVisitor, TimeSignatureVisitor } from './index';

const { Flow } = Vex;

/**
 * This class implements a visitor used to convert MusicXML measures to VexFlow staves
 */
class MeasureVisitor {
  visit(measure) {
    console.log(`Part: ${measure.Part}, Number: ${measure.Number}, ${measure.StartClefs.length}`);
    const staveList = [];
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
      staveList.push({
        staff: flowStave,
        key: measure.Attributes.Key.accept(KeyVisitor),
        clef: staveClef,
        time: measure.Attributes.Time.accept(TimeSignatureVisitor),
      });

      // Adding time signatures
      const timingChange = JSON.stringify(measure.Time) !== JSON.stringify(measure.lastMeasure.Time);
      if (measure.Number === 1 || timingChange) {
        flowStave.addTimeSignature(measure.Attributes.Time.accept(TimeSignatureVisitor));
      }
    }

    return staveList;
  }
}

export const measureVisitor = new MeasureVisitor();
