import Vex from 'vexflow';
import { Voice } from './Voice.js';

const Flow = Vex.Flow;

export class Measure {
  constructor(xmlMeasure, format, ctx) {
    this.staveList = [];
    this.voiceList = [];
    this.connectors = [];
    this.xmlMeasure = xmlMeasure;
    this.context = ctx;
    this.format = format;
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
    const lastMeasure = number === format.totalMeasures;

    this.x = format.staveXOffset + (number - 1) % format.measuresPerStave * format.staveWidth;
    this.y = lineOnPage * format.systemSpace;

    const allStaves = xmlMeasure.getStaves();
    for (let s = 0; s < allStaves; s++) {
      const stave = s + 1;

      let staveClef = xmlMeasure.StartClefs[s].getVexClef();
      if (staveClef === undefined) {
        staveClef = 'treble';
      }

      const flowStave = new Flow.Stave(this.x, this.y + s * 100 + part * 100, this.width)
        .setContext(ctx);
      if (firstInLine) { // || xmlMeasure.StartClefs[s] !== xmlMeasure.Attributes.Clef[s]) {
        console.log(xmlMeasure.toString(), `Stave: ${stave}`, staveClef);

        flowStave.addClef(staveClef);
      }
      this.staveList.push(flowStave);
      // this.context.fillText(`Measure: ${this.xmlMeasure.Number} Num in line: ${firstInLine}`,
      // this.x, this.y + 30 + s * 100 + part * 100);

      const options = { ctx, formatter: this.formatter, stave, staveClef, flowStave, time: xmlMeasure.Attributes.Time };
      const v = new Voice(xmlMeasure, options);
      this.voiceList.push(v);

      // Adding time signatures
      if (xmlMeasure.Attributes.TimingChange) {
        const curTime = xmlMeasure.Attributes.Time !== undefined ? xmlMeasure.Attributes.Time.getVexTime() : 'C';
        flowStave.addTimeSignature(curTime.num_beats + '/' + curTime.beat_value);
      }
    } // Staves
    this.addConnectors(firstInLine, lastMeasure);
  } // Constructor

  draw() {
    this.staveList.forEach(s => s.draw());
    this.voiceList.forEach(n => n.draw());
    this.connectors.forEach(c => c.draw());
  }

  addConnectors(firstInLine, lastMeasure) {
    if (this.staveList.length === 1 && lastMeasure) {
      this.staveList[0].setEndBarType(Flow.Barline.type.END);
    }
    for (let s = 0; s < this.staveList.length - 1; s++) {
      const firstStave = this.staveList[s];
      const secondStave = this.staveList[s + 1];
      // Beginning of system line
      if (firstInLine) {
        this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.SINGLE_LEFT);
        this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.BRACE);
      }
      // Every measure
      this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.SINGLE_RIGHT);
      // End of score
      if (lastMeasure) {
        this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
      }
    }
  }

  /**
   * Adds a connector between two staves
   *
   * @param {Stave} stave1: First stave
   * @param {Stave} stave2: Second stave
   * @param {Flow.StaveConnector.type} type: Type of connector
   */
  addConnector(stave1, stave2, type) {
    this.connectors.push(
      new Flow.StaveConnector(stave1, stave2)
        .setType(type)
        .setContext(this.context));
  }
}
