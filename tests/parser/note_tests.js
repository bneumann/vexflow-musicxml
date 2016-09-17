const common = require('../common');

const gTestContext = common.gTestContext;
const assert = common.assert;
const fs = common.fs;
const dom = common.dom;
const xpath = common.xpath;
const MusicXml = common.MusicXml;

const data = fs.readFileSync(gTestContext.mocks[0], { 'encoding': 'utf8' });
const MOCK1 = new MusicXml(data);

/**
 * Basic test cases for loading and accessing XML
 *
 */
describe('Vexflow tests', function() {
  this.timeout(10000);
  it('Check if staves are loaded correctly', () => {
    assert.strictEqual(MOCK1.Parts[0].getAllStaves().length, 1, 'Number of staves should be 1');
  });
  it('Check if clefs are loaded correctly', () => {
    assert.strictEqual(MOCK1.Parts[0].Measures[0].getAllClefs()[0].Number, 1, 'This example has only one staff so clef should be 1');
  });
  it('Check if times are loaded correctly', () => {
    assert.strictEqual(MOCK1.Parts[0].Measures[0].getAllTimes().length, 1, 'Number of times should be 1');
  });
  it('Check if beams are set correctly', () => {
    assert.strictEqual(MOCK1.Parts[0].Measures[0].Notes[0].BeamState, false, 'First not is a while and shouldnt have a beam');
    assert.strictEqual(MOCK1.Parts[0].Measures[0].Notes[1].BeamState, true, 'This Note should be part of a beam group');
    assert.strictEqual(MOCK1.Parts[0].Measures[0].Notes[2].BeamState, true, 'This Note should be part of a beam group');
    assert.strictEqual(MOCK1.Parts[0].Measures[0].Notes[3].BeamState, true, 'This Note should be part of a beam group');
  });
});
