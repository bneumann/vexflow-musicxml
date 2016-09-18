/**
* @file
* @description Parser and renderer for Music XML files to Vex Flow
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

import Vex from 'vexflow';
import MusicXml from './MusicXml.js';

const Flow = Vex.Flow;

/**
 * MusicXmlRenderer aka VexRenderer
 * @property {Array} VexRenderer.keySpec - An arrayed version of the Vex keyspec
 */
class VexRenderer {
  constructor(data, canvas) {
    this.musicXml = new MusicXml(data);
    this.canvas = canvas;
    this.renderer = new Flow.Renderer(this.canvas, Flow.Renderer.Backends.CANVAS);
    this.ctx = this.renderer.getContext();

    this.staveList = [];

    this.keySpec = [];
    for (const k in Flow.keySignature.keySpecs) {
      if ({}.hasOwnProperty.call(Flow.keySignature.keySpecs, k)) {
        const newEntry = Flow.keySignature.keySpecs[k];
        newEntry.name = k;
        this.keySpec.push(newEntry);
      }
    }

    // Some formatting constiables
    this.staveSpace = 100;
    this.staveWidth = 250;
    this.staveXOffset = 20;
    this.staveYOffset = 20;
    this.systemSpace = this.staveSpace * 2 + 50;

    this.layout = this.calculateLayout();
    this.parse();
  }

  calculateLayout() {
    const mps = Math.floor(this.canvas.width / this.staveWidth); // measures per stave
    // Reset the stave width to fill the page
    this.staveWidth = Math.round(this.canvas.width / mps) - this.staveXOffset;
    // TODO: Use page height for calculation
    const measures = this.musicXml.Parts[0].Measures;
    const lpp = Math.ceil(measures.length / mps);    // lines per page
    const sps = this.musicXml.Parts
              .map(p => p.getAllStaves()) // get all the staves in a part
              .map(sa => sa.length)       // get the length of the array (number of staves)
              .reduce((e, ne) => e + ne);   // sum them up

    const a = [];
    let idx = 0;

    for (let s = 0; s < sps; s++) { // systems / all staves
      for (let l = 0; l < lpp; l++) { // lines
        for (let m = 0; m < mps; m++) { // measures
          const point = {
            x: (this.staveWidth * m) + this.staveXOffset,
            y: l * this.systemSpace + s * this.staveSpace + this.staveYOffset,
            index: idx,
          };
          // uncomment for debug purposes
          // this.ctx.fillText(' line: ' + l +
          //                   ' stave ' + s +
          //                   ' measure ' + m +
          //                   ' index: ' + idx, point.x, point.y)
          a.push(point);
          idx++;
          if (idx === measures.length) {
            idx = 0;
            break;
          }
        }
      }
    }
    // console.log(a);
    const ret = {
      measPerStave: mps,
      linesPerPage: lpp,
      systems: sps,
      points: a,
    };
    return ret;
  }

  parse() {
    const allParts = this.musicXml.Parts;
    let curSystem = 0;
    let mIndex = 0;
    allParts.forEach((part) => {
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
          mIndex++;
          measureList.push(stave);

          // Check if we have keys in this measure
          if (allMeasureWithKeys.indexOf(meas) > -1) {
            const key = this.getVexKey(meas.Attributes[0].Key);
            console.log('key', key);
            stave.addKeySignature(key);
          }
          const allClefs = meas.getAllClefs();
          const allTimes = meas.getAllTimes();
          // Adding clef information to the stave
          if (allClefs.length > 0) {
            curClef = allClefs[staffInfo.si] ? allClefs[staffInfo.si].getVexClef() : curClef;
            stave.addClef(curClef);
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
          stave.setContext(this.ctx).draw();

          // Adding notes
          // const curNotes = meas.getNotesByStaff(staffInfo.stave);
          let curNotes = meas.getNotesByBackup();
          curNotes = curNotes[staffInfo.si];
          // FIXME: Backup mechanism ftw... :(
          const staffNoteArray = [];
          // filter chord notes. They are automatically returned by the getVexNote function
          if (curNotes) {
            curNotes = curNotes.filter(n => n.isInChord === false);
            curNotes.forEach(n => {
              const vn = n.getVexNote();
              vn.clef = n.isRest ? 'treble' : curClef;
              const sn = new Flow.StaveNote(vn);
              for (let i = 0; i < n.Dots; i++) {
                sn.addDotToAll();
              }
              sn.setStave(stave);
              staffNoteArray.push(sn);
            }); // Notes


            // Beaming: mxml has a start, end and continue for beams. VexFlow
            // handles the number of beams itself so we only need to group the
            // notes depending on their "BeamState"
            // const beamStates = curNotes.map(n => n.BeamState);
            const beamList = [];
            let beamNotes = [];
            curNotes.forEach((b, i) => {
              if (b.BeamState) {
                beamNotes.push(staffNoteArray[i]);
                // Beams do only make sense if more then 1 note is involved
                if (beamNotes.length > 1 && b.isLastBeamNote) {
                  beamList.push(new Flow.Beam(beamNotes));
                  beamNotes = [];
                }
              }
            });

            // Draw notes
            Flow.Formatter.FormatAndDraw(this.ctx, stave, staffNoteArray);
            // Draw beams
            beamList.forEach(beam => beam.setContext(this.ctx).draw());
          }
        }); // Measures
        this.staveList.push(measureList);
        if (this.staveList.length >= 2) {
          const topStave = this.staveList[0];
          const bottomStave = this.staveList[1];
          for (const measureIdx in topStave) {
            if (measureIdx % this.layout.measPerStave === 0) {
              this.addConnector(topStave[measureIdx],
                                bottomStave[measureIdx],
                                Flow.StaveConnector.type.BRACE);
            }
            this.addConnector(topStave[measureIdx],
                              bottomStave[measureIdx],
                              Flow.StaveConnector.type.SINGLE_LEFT);
            this.addConnector(topStave[measureIdx],
                              bottomStave[measureIdx],
                              Flow.StaveConnector.type.SINGLE_RIGHT);
          }
        }
      }); // Staves
    }); // Parts
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

  addConnector(stave1, stave2, type) {
    new Flow.StaveConnector(stave1, stave2)
      .setType(type)
      .setContext(this.ctx)
      .draw();
  }

  draw() {
  }
}

const MusicXmlRenderer = VexRenderer;
export default MusicXmlRenderer;
