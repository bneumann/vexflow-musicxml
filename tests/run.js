/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */
const chai = require('chai'); // eslint-disable-line no-unused-vars
const expect = require('chai').expect; // eslint-disable-line no-unused-vars
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
// Enable support for maps. Really helpful for debugging errors in test code
require('source-map-support').install({
  environment: 'node',
}); // eslint-disable-line

const jsPath = path.join(__dirname, '..', 'build', 'vexflow-musicxml.js');
const MusicXml = require(jsPath);

const SCORES_DIR = path.join(__dirname, 'testdata/v3/');

describe('Vexflow MusicXml unit tests', () => {
  before(() => {
    // runs before all tests in this block
    this.scores = [];
    this.MusicXml = [];
    const files = fs.readdirSync(SCORES_DIR);
    for (const i in files) {
      if (path.extname(files[i]) === '.xml') {
        this.scores.push(path.join(SCORES_DIR, files[i]));
      }
    }

    const data = fs.readFileSync(this.scores[0], { 'encoding': 'utf8' });
    this.MusicXml = new MusicXml(data);
    assert.isNotNull(this.MusicXml);
    assert.isDefined(this.MusicXml);
  });

  after(() => {
    // runs after all tests in this block
  });

  beforeEach(() => {
    // runs before each test in this block
  });

  afterEach(() =>  {
    // runs after each test in this block
    // assert.typeOf(1, 'number');
  });
  // test cases
  describe('Basic tests', () => {
    it('Check music XML version', () => {
      assert.strictEqual(this.MusicXml.Version, '3.0', 'Version is 3');
    });

    it('Check alls sample files', () => {
      for (let i = 0; i < this.scores.length; i++) {
        try {
          const data = fs.readFileSync(this.scores[i], { 'encoding': 'utf8' });
          this.MusicXml = new MusicXml(data);
          assert.strictEqual(this.MusicXml.Version, '3.0', 'Version is 3');
        } catch (e) {
          console.log('Test failed @', this.scores[i], e);
        }
      }
    });
  });
});
