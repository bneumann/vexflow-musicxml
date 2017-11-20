import Vex from './index.js';

// const file1 = 'ActorPreludeSample.xml';
// const file1 = 'mock1.xml';
const file1 = 'BeetAnGeSample.xml';
// const file1 = 'BWV_0773.xml';
// const file1 = 'BWV_0781.xml';
// eslint-disable-next-line no-undef
$(document).ready(() => {
  loadXMLDoc();
});

// Predefine renderer as global variable
let renderer = [];

function render() {
  if (this.readyState === 4 && this.status === 200) {
    // eslint-disable-next-line no-undef
    const canvas = $('#canvas')[0];
    // eslint-disable-next-line no-undef
    const parts = $('#parts')[0];
    // eslint-disable-next-line no-undef
    const start = $('#start')[0];
    // eslint-disable-next-line no-undef
    const stop = $('#stop')[0];
    console.log($('#startDrop').dropdown);

    renderer = new Vex.Flow.MusicXmlRenderer(this.response, canvas);
    for (let i = 0; i < renderer.musicXml.Parts.length; i++) {
      $('<div class="item">' + renderer.musicXml.Parts[i].Name + '</div>').appendTo(parts);
    }
    for (let i = 0; i < renderer.musicXml.Parts[0].Measures.length; i++) {
      $('<div class="item">Measure ' + i + '</div>').appendTo(start);
      $('<div class="item">Measure ' + i + '</div>').appendTo(stop);
    }
  }
}

function loadXMLDoc() {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = render;
  xmlhttp.open('GET', file1, true);
  xmlhttp.send();
}
