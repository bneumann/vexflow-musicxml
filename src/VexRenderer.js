/**
* @file
* @description Parser and renderer for Music XML files to Vex Flow
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

import Vex from 'vexflow';
import { MusicXml } from './xml/MusicXml.js';
import { Utils } from './xml/Utils.js';
import { Measure } from './vex/Measure.js';

const { Flow } = Vex;

/**
 * MusicXmlRenderer aka VexRenderer
 * @param
 */
export class VexRenderer {
  constructor(data, canvas, dontPrint) {
    this.musicXml = new MusicXml(data);
    console.log(Flow);
    console.log(this.musicXml);
    console.log(Flow.NoteVisitor);

    console.log(this.musicXml.Parts[0].Measures[9].Notes[0].accept(Flow.NoteVisitor));
    // const part = 1;
    // const from = 0;
    // const to = 1;
    // this.musicXml.Parts = [this.musicXml.Parts[part]];
    // this.musicXml.Parts[0].Measures = this.musicXml.Parts[0].Measures.slice(from, to);
    this.isSvg = !(canvas instanceof HTMLCanvasElement);
    this.canvas = canvas;
    // eslint-disable-next-line max-len
    this.renderer = new Flow.Renderer(this.canvas, this.isSvg ? Flow.Renderer.Backends.SVG : Flow.Renderer.Backends.CANVAS);

    // Internal property to set if layout information should be printed
    // on score
    this.mDebug = true;

    // Properties for rendering
    this.ctx = this.renderer.getContext();
    this.staveList = [];
    this.beamList = [];
    this.connectors = [];
    this.voiceList = [];

    this.keySpec = [];
    for (const k in Flow.keySignature.keySpecs) {
      if ({}.hasOwnProperty.call(Flow.keySignature.keySpecs, k)) {
        const newEntry = Flow.keySignature.keySpecs[k];
        newEntry.name = k;
        this.keySpec.push(newEntry);
      }
    }
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
      measuresPerStave: this.measuresPerStave,
      staveWidth: this.staveWidth,
      stavesPerSystem: this.musicXml.getStavesPerSystem(),
      width: this.width,
      linesPerPage: Math.ceil(this.musicXml.Parts[0].Measures.length / this.measuresPerStave),
    };
    // Set the SVG viewbox according to the calculated layout
    const vb = [0, 0, this.width, this.getScoreHeight()];
    this.ctx.setViewBox(vb);
    // this.layout = this.calculateLayout();
    console.time("parse");
    this.parseNew();
    console.timeEnd("parse");
  }

  getScoreHeight() {
    return this.systemSpace * this.format.linesPerPage;
  }

  // https://github.com/0xfe/vexflow/blob/1.2.83/tests/formatter_tests.js line 271
  parseNew() {
    // console.profile('parse');
    const drawables = [];
    const allParts = this.musicXml.Parts;
    for (const [p] of allParts.entries()) {
      const part = allParts[p];
      for (const [, measure] of part.Measures.entries()) {
        drawables.push(new Measure(measure, this.format, this.ctx));
      }
    }
    drawables.forEach(d => d.draw());
    // console.profileEnd();
    return this;
  }

  /**
   *
   * From the docs:
   * Traditional key signatures are represented by the number
   * of flats and sharps, plus an optional mode for major/
   * minor/mode distinctions. Negative numbers are used for
   * flats and positive numbers for sharps, reflecting the
   * key's placement within the circle of fifths (hence the
   * element name).
   * @param {Key} Key object to be translated
   * @returns {VexKey} Vex object
   */
  getVexKey(key) {
    let filteredKeys = this.keySpec.filter(k => k.num === Math.abs(key.Fifths));
    const mode = key.Mode === 'major' ? 0 : 1;
    if (key.Fifth < 0) {
      filteredKeys = filteredKeys.filter(k => k.acc === 'b');
    } else if (key.Fifths > 0) {
      filteredKeys = filteredKeys.filter(k => k.acc === '#');
    }
    const entry = filteredKeys[mode].name;
    return entry;
  }

/**
 * Adds all the connectors between the systems.
 *
 */
  addConnectors() {
    for (let s = 0; s < this.staveList.length - 1; s++) {
      for (let m = 0; m < this.staveList[s].length; m++) {
        const firstStave = this.staveList[s][m];
        const secondStave = this.staveList[s + 1][m];
        // Beginning of system line
        if (m % this.layout.measPerStave === 0) {
          this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.SINGLE_LEFT);
          if (firstStave.system === secondStave.system) {
            this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.BRACE);
          }
        }
        // Every measure
        if (firstStave.system === secondStave.system) {
          this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.SINGLE_RIGHT);
        }
        // End of score
        if (m === this.staveList[s].length - 1) {
          if (firstStave.system === secondStave.system) {
            this.addConnector(firstStave, secondStave, Flow.StaveConnector.type.BOLD_DOUBLE_RIGHT);
          } else {
            firstStave.setEndBarType(Flow.Barline.type.END);
          }
        }
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
      .setContext(this.ctx));
  }

}
