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

const Flow = Vex.Flow;

/**
 * MusicXmlRenderer
 * @param
 */
export class MusicXmlRenderer {
  constructor(data, canvas, dontPrint) {
    console.profile('parsing');
    this.musicXml = new MusicXml(data);
    console.profileEnd('parsing');
    console.log(this.musicXml);
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

    // Create a lookup table of key names ("C", "B", etc.) that map to key objects
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
    if (dontPrint !== false) {
      this.parse();
    }
  }

  getScoreHeight() {
    return this.systemSpace * this.format.linesPerPage;
  }

  // https://github.com/0xfe/vexflow/blob/1.2.83/tests/formatter_tests.js line 271
  parse() {
    const drawables = [];
    const allParts = this.musicXml.Parts;
    for (const [p] of allParts.entries()) {
      const part = allParts[p];
      for (const [, measure] of part.Measures.entries()) {
        drawables.push(new Measure(measure, this.format, this.ctx));
      }
    }
    drawables.forEach(d => d.draw());
  }

  parseOld() {
    // Reset all lists
    this.staveList = [];
    this.beamList = [];
    this.connectors = [];
    this.voiceList = [];

    const allParts = this.musicXml.Parts;
    let curSystem = 0;
    let mIndex = 0;
    allParts.forEach((part, pIdx) => {
      const allMeasures = part.Measures;
      const allStaves = part.getAllStaves();
      const allMeasureWithKeys = part.getAllMeasuresWithKeys();

      let stave = {};
      stave.width = this.staveWidth;
      // Iterate all staves in this part
      allStaves.forEach((curStave, si) => {
        const staffInfo = {
          'stave': curStave,
          'si': si,
        };
        const measureList = [];
        // The notes can be set to bass, treble, etc. with the clef.
        // So we need to remember the last clef we used
        let curClef = 'treble';
        let curTime = { num_beats: 4, beat_value: 4, resolution: Flow.RESOLUTION };
        // Iterate all measures in this stave
        allMeasures.forEach((meas, mi) => {
          const newSystem = this.layout.measPerStave % (mi + 1) > 0;
          curSystem = newSystem ? curSystem + 1 : curSystem;
          const point = this.layout.points[mIndex];
          stave = new Flow.Stave(point.x, point.y, stave.width);
          // Keep track which stave belongs to which part. Needed for connectors
          stave.system = pIdx;
          mIndex++;
          measureList.push(stave);

          // Check if we have keys in this measure
          if (allMeasureWithKeys.indexOf(meas) > -1) {
            const key = this.getVexKey(meas.Attributes[0].Key);
            stave.addKeySignature(key);
          }
          const allClefs = meas.getAllClefs();
          const allTimes = meas.getAllTimes();
          // Adding clef information to the stave
          if (allClefs.length > 0) {
            // Only change if the clef change is meant for this stave
            if (allClefs[staffInfo.si] && staffInfo.stave === allClefs[staffInfo.si].Number) {
              curClef = allClefs[staffInfo.si] ? allClefs[staffInfo.si].getVexClef() : curClef;
              stave.addClef(curClef);
            }
          }
          // Adding time information to the stave & voice
          if (allTimes[staffInfo.si]) {
            curTime = allTimes[staffInfo.si].getVexTime();
            curTime.resolution = Flow.RESOLUTION;
          }
          if (mi === 0 || allTimes[staffInfo.si]) {
            if (1) { // eslint-disable-line
              stave.addTimeSignature(curTime.num_beats + '/' + curTime.beat_value);
            } else {
              stave.addTimeSignature('C');
            }
          }
          stave.setContext(this.ctx);

          // Adding notes
          // const curNotes = meas.getNotesByStaff(staffInfo.stave);
          let curNotes = Utils.getNotesByBackup(meas.Notes);
          curNotes = curNotes[staffInfo.si];
          // FIXME: Backup mechanism ftw... :(
          const staffNoteArray = [];
          // filter chord notes. They are automatically returned by the getVexNote function
          if (curNotes) {
            curNotes = curNotes.filter(n => n.isInChord === false);
            let lastTempClef = curClef;
            curNotes.forEach((n) => {
              const vn = n.getVexNote();
              const tempClef = n.getClef() ? n.getClef().getVexClef() : curClef;
              // console.log('Clefs: ', n.getClef(), ' Note: ', n.Pitch);
              vn.clef = n.isRest ? 'treble' : tempClef;
              const sn = new Flow.StaveNote(vn);
              if (tempClef !== lastTempClef) {
                lastTempClef = tempClef;
                // console.log(tempClef);
                const cn = new Flow.ClefNote(tempClef, 'small');
                sn.addModifier(0, new Flow.NoteSubGroup([cn]));
                // console.log(cn);
              }
              for (let i = 0; i < n.Dots; i++) {
                sn.addDotToAll();
              }
              sn.setStave(stave);
              const acc = n.getAccidental();
              if (acc !== null) {
                sn.addAccidental(0, new Flow.Accidental(acc));
              }

              staffNoteArray.push(sn);
            }); // Notes


            // Beaming: mxml has a start, end and continue for beams. VexFlow
            // handles the number of beams itself so we only need to group the
            // notes depending on their "BeamState"
            // const beamStates = curNotes.map(n => n.BeamState);
            let beamNotes = [];
            curNotes.forEach((b, i) => {
              if (b.BeamState) {
                beamNotes.push(staffNoteArray[i]);
                // Beams do only make sense if more then 1 note is involved
                if (beamNotes.length > 1 && b.isLastBeamNote) {
                  this.beamList.push(new Flow.Beam(beamNotes));
                  beamNotes = [];
                }
              }
            });

            // Draw notes
            const voice = new Flow.Voice(curTime)
              .setMode(Flow.Voice.Mode.SOFT)
              .addTickables(staffNoteArray);
            // FIXME: This would only add 1 voice per stave.
            new Flow.Formatter()
              .joinVoices([voice], { align_rests: false })
              .formatToStave([voice], stave, { align_rests: false, stave });

            this.voiceList.push(voice);
          }
        }); // Measures
        this.staveList.push(measureList);
      }); // Staves
    }); // Parts
    this.addConnectors();
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
