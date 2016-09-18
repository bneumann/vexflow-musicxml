/**
* @file This is the main test file. All tests are started from here
* @module Test
* @author {@link mailto:neumann.benni@gmail.com|neumann.benni@gmail.com}
* @version 0.1
*/

/**
 * @function UnitTests
 * @desc All unit tests that have to do with load and validating data
 * */
describe('Vexflow MusicXml unit tests', () => {
  describe('Basic xml parser tests', () => {
    // require('./parser/basic_tests.js');
  });

  describe('Vex specific conversion tests', () => {
    require('./parser/note_tests.js');
  });
});
