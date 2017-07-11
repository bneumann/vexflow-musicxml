import Vex from 'vexflow';
import { Voice } from './Voice.js';

const Flow = Vex.Flow;

export class Measure {
  constructor(xmlMeasure, format, ctx) {
    this.staveList = [];
    this.voiceList = [];
    this.xmlMeasure = xmlMeasure;
    this.context = ctx;
    // FIXME: The formatter should be available in all vex components
    this.formatter = new Flow.Formatter();
    // console.log(xmlMeasure.Attributes, xmlMeasure.Part);

    // TODO: Figure out a way to use the given width with a dynamic layout
    const width = format.staveWidth; // this.xmlMeasure.Width;
    this.width = document.body.clientWidth < width ? document.body.clientWidth : width;
    // Get the part we are in
    const part = this.xmlMeasure.Part - 1;
    // Get the absolute measure number
    const number = this.xmlMeasure.Number;
    // Calculate the line where this measure is on the page
    const lineOnPage = Math.ceil(number / format.measuresPerStave) - 1;

    const firstInLine = (number - 1) % format.measuresPerStave === 0;

    this.x = format.staveXOffset + (number - 1) % format.measuresPerStave * format.staveWidth;
    this.y = lineOnPage * format.systemSpace;

    const allStaves = xmlMeasure.getStaves();
    const time = xmlMeasure.getTime();
    const clefs = xmlMeasure.getClefs();

    for (const [s, stave] of allStaves.entries()) {
      const allClefs = xmlMeasure.getClefsByStaff(stave);
      console.log(xmlMeasure, allClefs, stave);

      const staveClef = allClefs[0].getVexClef();
      const flowStave = new Flow.Stave(this.x, this.y + s * 100 + part * 100, this.width)
        .setContext(ctx);
      if (firstInLine) {
        flowStave.addClef(staveClef);
      }
      this.staveList.push(flowStave);
      // this.context.fillText(`Measure: ${this.xmlMeasure.Number} Num in line: ${firstInLine}`, this.x, this.y + 30 + s * 100 + part * 100);

      const options = { ctx, formatter: this.formatter, stave, staveClef, flowStave, time };
      this.voiceList.push(new Voice(xmlMeasure, options));
    } // Staves
  } // Constructor

  draw() {
    this.staveList.forEach(s => s.draw());
    this.voiceList.forEach(n => n.draw());
  }
}
