/* eslint import/no-extraneous-dependencies: ["error", {"optionalDependencies": false}] */
const chai = require('chai'); // eslint-disable-line no-unused-vars
const expect = require('chai').expect; // eslint-disable-line no-unused-vars
const assert = require('chai').assert; // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

chai.should();

// Enable support for maps. Really helpful for debugging errors in test code
require('source-map-support').install({
  environment: 'node',
}); // eslint-disable-line

const jsPath = path.join(__dirname, '..', 'build', 'vexflow-musicxml-tests.js');
const MusicXml = require(jsPath);
const SCORES_DIR = path.join(__dirname, 'testdata/v3/');
const MOCK_DIR = path.join(__dirname, 'testdata/mock/');
const gTestContext = { scores: [], mocks: [], MusicXml: undefined };

const files = fs.readdirSync(SCORES_DIR);
for (const i in files) {
  if (path.extname(files[i]) === '.xml') {
    gTestContext.scores.push(path.join(SCORES_DIR, files[i]));
  }
}

// mocks are carfully designed XMLs that represent certain use cases.
// You can test special things like numbers of notes, measures, staves on it
const mocks = fs.readdirSync(MOCK_DIR);
for (const i in mocks) {
  if (path.extname(mocks[i]) === '.xml') {
    gTestContext.mocks.push(path.join(MOCK_DIR, mocks[i]));
  }
}

const data = fs.readFileSync(gTestContext.scores[0], { 'encoding': 'utf8' });
gTestContext.MusicXml = new MusicXml(data);

const result = {
  'MusicXml': MusicXml,
  'assert': chai.assert,
  'expect': chai.expect,
  'gTestContext': gTestContext,
  'dom': dom,
  'xpath': xpath,
  'fs': fs,
};

module.exports = result;
