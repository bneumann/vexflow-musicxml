import Vex from 'vexflow';

const Flow = Vex.Flow;

export class Voice {
  constructor(xmlMeasure, options) {
    // Voices
    const { stave, ctx, formatter, flowStave, time, staveClef } = options;

    this.voiceList = [];
    this.beamList = [];
    this.formatter = formatter;

    for (const [, voice] of xmlMeasure.Voices.entries()) {
      const voiceNotes = xmlMeasure
        .getNotesByStaff(stave)
        .getNotesByVoice(voice)
        .Notes
        .filter(n => n.isInChord === false);
      if (voiceNotes.length > 0) {
        // Notes
        const noteList = [];
        let beamNoteList = [];
        for (const [, notes] of voiceNotes.entries()) {
          const note = notes.getVexNote();
          note.clef = note.isRest ? 'treble' : staveClef;
          const flowNote = new Flow.StaveNote(note)
           .setContext(ctx)
           .setStave(flowStave);
          noteList.push(flowNote);
          // Accidentals
          const acc = notes.getAccidental();
          if (acc) {
            noteList[noteList.length - 1].addAccidental(0, new Flow.Accidental(acc));
          }
          // Beams
          if (notes.BeamState) {
            beamNoteList.push(flowNote);
            // Beams do only make sense if more then 1 note is involved
            if (beamNoteList.length > 1 && notes.isLastBeamNote) {
              this.beamList.push(new Flow.Beam(beamNoteList)
                .setContext(ctx));
              beamNoteList = [];
            }
          }
        } // Notes
        if (noteList.length > 0) {
          const vexVoice = new Flow.Voice(time.getVexTime())
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
  }

  getVoices() {
    return this.voiceList;
  }

  draw() {
    this.voiceList.forEach(n => n.draw());
    this.beamList.forEach(b => b.draw());
  }
}
