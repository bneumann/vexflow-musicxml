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
      // console.log(`Stave: ${stave}, ${flowStave}, voice: ${voice}`);
      if (voiceNotes.length > 0) {
        // Notes
        const noteList = [];
        let beamNoteList = [];
        for (const [, notes] of voiceNotes.entries()) {
          // console.log(`Part ${xmlMeasure.Part}, Measure ${xmlMeasure.Number}: \n${notes.mAttributes === xmlMeasure.Attributes},\nMeasureclef ${staveClef}`);
          const note = notes.getVexNote();
          const newClef = notes.hasClefChange ? notes.mAttributes.Clef[stave - 1].getVexClef() : staveClef;
          note.clef = note.isRest ? 'treble' : newClef;
          // console.log(`Part: ${xmlMeasure.Part}, Measure: ${xmlMeasure.Number}, Key: ${note.keys[0]}`);

          try {
            // FIXME: This call causes RunTime errors!
            var flowNote = new Flow.StaveNote(note);
            flowNote.setContext(ctx);
            flowNote.setStave(flowStave);
            if (notes.hasClefChange) {
              const cn = new Flow.ClefNote(newClef, 'small');
              flowNote.addModifier(0, new Flow.NoteSubGroup([cn]));
            }
            // console.log(xmlMeasure.Part, xmlMeasure.Number, newClef, notes.mAttributes.Clef[stave - 1], staveClef);
            noteList.push(flowNote);
          } catch(e) {
            console.log("ErrorV: ", e, note, flowStave, newClef);
          }

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
