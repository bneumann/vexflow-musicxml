import Vex from 'vexflow';
import { NoteVisitor, TimeVisitor } from '../visitors/index';

const { Flow } = Vex;

export class Voice {
  constructor(xmlMeasure, options) {
    // Voices
    const {
      stave,
      ctx,
      formatter,
      flowStave,
      time,
      staveClef,
    } = options;

    this.voiceList = [];
    this.beamList = [];
    this.slurList = [];
    this.formatter = formatter;

    for (const [, voice] of xmlMeasure.Voices.entries()) {
      const voiceNotes = xmlMeasure
        .getNotesByStaff(stave)
        .getNotesByVoice(voice)
        .Notes
        .filter(n => n.isInChord === false);
      // console.log(`Stave: ${stave}, voice: ${voice}`);
      if (voiceNotes.length > 0) {
        // Notes
        const noteList = [];
        let beamNoteList = [];
        let slurNoteList = [];
        for (let n = 0; n < voiceNotes.length; n++) {
          const xmlNote = voiceNotes[n];
          // const vexNote = xmlNote.getVexNote();
          let clefChange = false;
          // FIXME: n > 0 is ONLY valid for the first measure. the clefchange can
          // also occure if the last not in the last measure was different from
          // the first note of this measure
          // Ergo: Last Measure needs to be accessible from this measure.
          if (n > 0) {
            const prevClef = voiceNotes[n - 1].Clef;
            const curClef = voiceNotes[n].Clef;
            clefChange = JSON.stringify(curClef) !== JSON.stringify(prevClef);
          }
          // const newClef = xmlNote.hasClefChange ? xmlNote.Clef.getVexClef() : staveClef;
          const flowNote = xmlNote.accept(NoteVisitor) // new Flow.StaveNote(note)
            .setContext(ctx)
            .setStave(flowStave);
          //       try {
          //         if (clefChange) {
          //     const cn = new Flow.ClefNote(newClef, 'small');
          //     flowNote.addModifier(0, new Flow.NoteSubGroup([cn]));
          //   }

          noteList.push(flowNote);
          // } catch (e) {
          //   console.log('ErrorV', e, vexNote, flowStave, newClef);
          // }



          // Beams
          if (xmlNote.BeamState) {
            beamNoteList.push(flowNote);
            // Beams do only make sense if more then 1 note is involved
            if (beamNoteList.length > 1 && xmlNote.isLastBeamNote) {
              this.beamList.push(new Flow.Beam(beamNoteList)
                .setContext(ctx));
              beamNoteList = [];
            }
          }

          // Slurs
          // TODO: Slurs can go over measure borders.uo
          if (xmlNote.Notation) {
            slurNoteList.push(flowNote);
            if (slurNoteList.length > 1 && xmlNote.IsLastSlur) {
              const tie = new Flow.StaveTie({
                first_note: slurNoteList[0],
                last_note: slurNoteList[slurNoteList.length - 1],
                first_indices: [0],
                last_indices: [0],
              });
              tie.setContext(ctx);
              // console.log(xmlNote.Notation);
              // tie.setDirection(xmlNote.Notation.Slur.placement === 'below' ? -1 : 1);
              this.slurList.push(tie);
              slurNoteList = [];
            }
          }
        } // Notes
        if (noteList.length > 0) {
          const vexVoice = new Flow.Voice(time.accept(TimeVisitor))
            .setMode(Flow.Voice.Mode.SOFT)
            .addTickables(noteList)
            .setContext(ctx);

          this.voiceList.push(vexVoice);
        }
      }
    } // Voices
    if (this.voiceList.length > 0) {
      // Only add voices if there are any in this stave
      this.formatter.joinVoices(this.voiceList, { align_rests: false })
        .formatToStave(this.voiceList, flowStave, { align_rests: false, flowStave });
    }
    // StaveTies
    // this.noteList
    // const tie = new Flow.StaveTie({
    //   first_note: params.from,
    //   last_note: params.to,
    //   first_indices: params.first_indices,
    //   last_indices: params.last_indices,
    // }, params.text);
  }

  getVoices() {
    return this.voiceList;
  }

  draw() {
    this.voiceList.forEach(n => n.draw());
    this.beamList.forEach(b => b.draw());
    this.slurList.forEach(s => s.draw());
  }
}
