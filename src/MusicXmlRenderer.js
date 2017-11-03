/**
* @file
* @description Parser and renderer for Music XML files to Vex Flow
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

import Vex from 'vexflow';
import { MusicXml } from './xml/MusicXml.js';
import { Measure } from './vex/Measure.js';
import { MeasureVisitor } from './visitors/index';

const { Flow } = Vex;

/**
 * MusicXmlRenderer
 * @param
 */
export class MusicXmlRenderer {
  constructor(data, canvas) {
    this.musicXml = new MusicXml(data);
    console.log(this.musicXml);

    if (false) {
      const part = 1;
      const from = 0;
      const to = 2;
      this.musicXml.Parts = [this.musicXml.Parts[part]];
      this.musicXml.Parts[0].Measures = this.musicXml.Parts[0].Measures.slice(from, to);
    }
    this.isSvg = !(canvas instanceof HTMLCanvasElement);
    this.canvas = canvas;
    // eslint-disable-next-line max-len
    this.renderer = new Flow.Renderer(this.canvas, this.isSvg ? Flow.Renderer.Backends.SVG : Flow.Renderer.Backends.CANVAS);

    // Internal property to set if layout information should be printed
    // on score
    this.mDebug = true;

    // Properties for rendering
    this.ctx = this.renderer.getContext();
    this.Drawables = [];

    // Create a lookup table of key names ("C", "B", etc.) that map to key objects
    this.stavesPerSystem = this.musicXml.Parts
      .map(p => p.getAllStaves()) // get all the staves in a part
      .reduce((e, ne) => e + ne);   // sum them up

    // Some formatting constants
    this.width = this.isSvg ? parseInt(this.canvas.getAttribute('width'), 10) : this.canvas.width;
    const startWidth = document.body.clientWidth < 250 ? document.body.clientWidth : 250;
    this.staveSpace = 100;
    this.staveXOffset = 20;
    this.staveYOffset = 20;
    this.systemSpace = this.staveSpace * this.stavesPerSystem + 50;
    this.measuresPerStave = Math.floor(this.width / startWidth); // measures per stave
    this.staveWidth = Math.round(this.width / this.measuresPerStave) - this.staveXOffset;

    this.format = {
      staveSpace: 100,
      staveXOffset: 20,
      staveYOffset: 20,
      systemSpace: this.systemSpace,
      // FIXME: Refactor to stavesPerMeasure
      measuresPerStave: this.measuresPerStave,
      totalMeasures: this.musicXml.Parts[0].Measures.length,
      staveWidth: this.staveWidth,
      stavesPerSystem: this.musicXml.getStavesPerSystem(),
      width: this.width,
      linesPerPage: Math.ceil(this.musicXml.Parts[0].Measures.length / this.measuresPerStave),
    };
    // Set the SVG viewbox according to the calculated layout
    const vb = [0, 0, this.width, this.getScoreHeight()];
    this.ctx.setViewBox(vb);
    console.time('parse');
    this.parse().render();
    console.timeEnd('parse');
  }

  getScoreHeight() {
    // FIXME: The 100 are only for deugging and should be removed
    return this.systemSpace * this.format.linesPerPage + 100;
  }

  // https://github.com/0xfe/vexflow/blob/1.2.83/tests/formatter_tests.js line 271
  parse() {
    const allParts = this.musicXml.Parts;
    for (const [p] of allParts.entries()) {
      const part = allParts[p];
      for (const [, measure] of part.Measures.entries()) {
        this.Drawables.push(new Measure(measure, this.format, this.ctx));
        measure.accept(MeasureVisitor);
      }
    }

    // Connect the first measures in a line
    const MeasuresFirstInLine = this.Drawables.filter(m => m.firstInLine);
    const MeasureNumsFirstInLine = new Set(MeasuresFirstInLine.map(m => m.xmlMeasure.Number));
    MeasureNumsFirstInLine.forEach((n) => {
      // Get all the measures from all parts with the same starting number.
      // Get their stavelist(s) and concatenate them in one array. Now we have an
      // array of staves that are in the first line.
      const system = [].concat(...MeasuresFirstInLine.filter(m => m.xmlMeasure.Number === n).map(m => m.staveList));
      for (let s = 0; s < system.length - 1; s++) {
        // It actually doesn't matter which measure we use for the connectors
        MeasuresFirstInLine[0].addConnector(system[s], system[s + 1], Flow.StaveConnector.type.SINGLE_LEFT);
      }
    });
    return this;
  }

  render() {
    this.Drawables.forEach(d => d.draw());
  }
}
