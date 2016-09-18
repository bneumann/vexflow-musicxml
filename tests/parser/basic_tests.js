const common = require('../common');

const gTestContext = common.gTestContext;
const assert = common.assert;
const fs = common.fs;
const dom = common.dom;
const xpath = common.xpath;
const MusicXml = common.MusicXml;

/**
 * Basic test cases for loading and accessing XML
 *
 */
describe('Basic tests', function() {
  this.timeout(10000);
  it('Checking init data', () => {
    assert.isNotNull(gTestContext.MusicXml);
    assert.isDefined(gTestContext.MusicXml);
  });

  it('Check music XML version', () => {
    assert.strictEqual(gTestContext.MusicXml.Version, '3.0', 'Version is 3');
  });

  it('Checking Identification', () => {
    const xml = fs.readFileSync(gTestContext.scores[0], { 'encoding': 'utf8' });
    const doc = new dom().parseFromString(xml);
    const nodes = xpath.select('//identification/encoding/software', doc);
    const creator = xpath.select('//identification/creator', doc);
    const title = xpath.select('//movement-title', doc);
    let str = '';
    for (let i = 0; i < nodes.length; i++) {
      str += nodes[i].textContent + '\n';
    }
    assert.isDefined(gTestContext.MusicXml.Identification.Encoding.Software, 'Software is define');
    assert.strictEqual(gTestContext.MusicXml.Identification.Encoding.Software, str.trim(), 'Software set correctly');
    assert.isDefined(gTestContext.MusicXml.Identification.Creator, 'Creator is defined');
    assert.strictEqual(gTestContext.MusicXml.Identification.Creator, creator[0].textContent, 'Creator matches');
    assert.isDefined(gTestContext.MusicXml.Title, 'Title is defined');
    assert.strictEqual(gTestContext.MusicXml.Title, title[0].textContent.trim(), 'Title matches');
  });

  it('Check if measures are loaded correctly', () => {
    assert.isAbove(gTestContext.MusicXml.Parts[0].Measures.length, 0, 'Measures seem valid');
  });

  it('Check if every sample files loading time is < 1 s and the average < 500 ms', (done) => {
    const statistics = [];
    for (let i = 0; i < gTestContext.scores.length; i++) {
      let elapsedTime = 10000;
      try {
        const data = fs.readFileSync(gTestContext.scores[i], { 'encoding': 'utf8' });
        const startTime = new Date().getTime();
        gTestContext.MusicXml = new MusicXml(data);
        elapsedTime = new Date().getTime() - startTime;
        statistics.push(elapsedTime);
      } catch (e) {
        console.warn('Test failed @', gTestContext.scores[i], e);
      }
      assert.strictEqual(gTestContext.MusicXml.Version, '3.0', 'Version is 3');
      assert.isBelow(elapsedTime / 1000, 1, 'Parsing does not exeed 1 second');
    }
    const avg = statistics.map((c, i, arr) => c / arr.length).reduce((p, c) => c + p);
    assert.isBelow(avg / 1000, 0.2, 'The mean value of parsing should not exceed 0.5 seconds');
    done();
  });

  it('Check for number of parts', (done) => {
    for (let i = 0; i < gTestContext.scores.length; i++) {
      const xml = fs.readFileSync(gTestContext.scores[i], { 'encoding': 'utf8' });
      const doc = new dom().parseFromString(xml);
      gTestContext.MusicXml = new MusicXml(xml);
      const nodes = xpath.select('//part-list/score-part', doc);
      assert.isAbove(gTestContext.MusicXml.Parts.length, 0, 'Parts are read correctly');
      assert.strictEqual(nodes.length, gTestContext.MusicXml.Parts.length, 'Number of parts is consistent');
    }
    done();
  });
});
