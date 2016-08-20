/**
* @file This is the main test file. All tests are started from here
* @module Test
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */
/* eslint func-names: ["error", "never"] */
/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
const chai = require('chai'); // eslint-disable-line no-unused-vars
const expect = require('chai').expect; // eslint-disable-line no-unused-vars
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
// Enable support for maps. Really helpful for debugging errors in test code
require('source-map-support').install({
  environment: 'node',
}); // eslint-disable-line

const jsPath = path.join(__dirname, '..', 'build', 'vexflow-musicxml.js');
const MusicXml = require(jsPath);

const SCORES_DIR = path.join(__dirname, 'testdata/v3/');
const gTestContext = { scores: [], MusicXml: undefined };

/**
 * @function UnitTests
 * @desc All unit tests that have to do with load and validating data
 * */
describe('Vexflow MusicXml unit tests', () => {
  /**
   * @function BeforeAll
   * @desc This runs before all the tests. We load one example file and check
   * if that worked
   * */
  before(() => {
    // runs before all tests in this block
    const files = fs.readdirSync(SCORES_DIR);
    for (const i in files) {
      if (path.extname(files[i]) === '.xml') {
        gTestContext.scores.push(path.join(SCORES_DIR, files[i]));
      }
    }

    const data = fs.readFileSync(gTestContext.scores[0], { 'encoding': 'utf8' });
    gTestContext.MusicXml = new MusicXml(data);
    assert.isNotNull(gTestContext.MusicXml);
    assert.isDefined(gTestContext.MusicXml);
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
  /**
   * Basic test cases for loading and accessing XML
   *
   */
  describe('Basic tests', function() {
    this.timeout(10000);
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

    it('Check if staves are loaded correctly', () => {
      assert.strictEqual(gTestContext.MusicXml.Parts[0].getAllStaves(), 4, 'Version is 3');
    });
    return;

    it('Check all sample files', (done) => {
      for (let i = 0; i < gTestContext.scores.length; i++) {
        let elapsedTime = 10000;
        try {
          const data = fs.readFileSync(gTestContext.scores[i], { 'encoding': 'utf8' });
          const startTime = new Date().getTime();
          gTestContext.MusicXml = new MusicXml(data);
          elapsedTime = new Date().getTime() - startTime;
        } catch (e) {
          console.warn('Test failed @', gTestContext.scores[i], e);
        }
        assert.strictEqual(gTestContext.MusicXml.Version, '3.0', 'Version is 3');
        assert.isBelow(elapsedTime, 1000, 'Parsing does not exeed 1 second');
      }
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
});
