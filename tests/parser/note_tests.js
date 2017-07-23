const common = require('../common');

const gTestContext = common.gTestContext;
const assert = common.assert;
const fs = common.fs;
const MusicXml = common.MusicXml;
// const MusicXmlRenderer = common.MusicXmlRenderer;

const data = fs.readFileSync(gTestContext.mocks[0], { 'encoding': 'utf8' });
const MOCK1 = new MusicXml(data);
const meas1 = MOCK1.Parts[0].Measures[0];
const meas2 = MOCK1.Parts[0].Measures[1];
const meas3 = MOCK1.Parts[0].Measures[2];
/**
 * Basic test cases for loading and accessing XML
 *
 */
// eslint-disable-next-line func-names
describe('Vexflow tests', function() {
  this.timeout(10000);
  it('Check if staves are loaded correctly', () => {
    assert.strictEqual(MOCK1.Parts[0].getAllStaves(), 1, 'Number of staves should be 1');
  });
  // FIXME: This test is actually not necessary because all measures have attributes due to the parsing
  it('Check attributes', () => {
    assert.strictEqual(meas1.hasAttributes(), true, 'This measure should have attributes');
    assert.notStrictEqual(meas2.Attributes, meas1.Attributes, 'This measure should not have attributes from the 1st measure');
    assert.strictEqual(MOCK1.Parts[0].getAllMeasuresWithKeys().length, 3, 'All measures should have attributes');
  });
  it('Check if clefs are loaded correctly', () => {
    assert.strictEqual(meas1.getAllClefs()[0].Number, 1, 'This example has only one staff so clef should be 1');
  });
  it('Check if times are loaded correctly', () => {
    assert.strictEqual(meas1.getAllTimes().length, 1, 'Number of times should be 1');
    assert.deepEqual(meas1.Attributes.Time, meas2.Attributes.Time, 'Measure 1 and 2 should have the same Time');
    assert.notStrictEqual(meas1.Attributes.Time, meas3.Attributes.Time, 'Measure 1 and 3 should not have the same Time');
  });
  it('Check if beams are set correctly', () => {
    assert.strictEqual(meas1.Notes[0].BeamState, false, 'First not is a while and shouldnt have a beam');
    assert.strictEqual(meas1.Notes[1].BeamState, true, 'This Note should be part of a beam group');
    assert.strictEqual(meas1.Notes[2].BeamState, true, 'This Note should be part of a beam group');
    assert.strictEqual(meas1.Notes[3].BeamState, true, 'This Note should be part of a beam group');
    assert.strictEqual(meas1.Notes[1].isLastBeamNote, false, 'This Note should not be the last of the beam group');
    assert.strictEqual(meas1.Notes[3].isLastBeamNote, true, 'This Note should be the last of the beam group');
  });
  it('Check if keys are interpreted correctly', () => {
    // FIXME: This reuqires either headless testing or browser support.
    // const Renderer = new MusicXmlRenderer(data);
  });
});
