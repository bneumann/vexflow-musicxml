const path = require('path');

module.exports = (grunt) => {
  const BANNER = [
    '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */',
  ].join('\n');

  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const DOC_DIR = path.join(BASE_DIR, 'doc');
  // const RELEASE_DIR = path.join(BASE_DIR, 'releases');
  const MODULE_ENTRY = path.join(BASE_DIR, 'src/MusicXml.js');
  const TARGET_RAW = path.join(BUILD_DIR, 'vexflow-musicxml.js');
  const TARGET_MIN = path.join(BUILD_DIR, 'vexflow-musicxml-min.js');
  const TARGET_TESTS = path.join(BUILD_DIR, 'vexflow-musicxml-tests.js');

  const SOURCES = ['src/*.js'];
  const TEST_SOURCES = [
    'tests/*_test.js',
    'tests/run.js',
  ];

  function webpackConfig(target, preset) {
    return {
      entry: MODULE_ENTRY,
      output: {
        path: '/',
        filename: target,
        library: 'MusicXml',
        libraryTarget: 'umd',
      },
      devtool: 'source-map',
      module: {
        loaders: [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
              presets: [preset],
              'plugins': ['add-module-exports', 'transform-object-assign'],
            },
          },
        ],
      },
    };
  }

  const webpackCommon = webpackConfig(TARGET_RAW, 'es2015');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      tests: {
        src: TEST_SOURCES,
        dest: TARGET_TESTS,
      },
    },
    uglify: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      build: {
        src: TARGET_RAW,
        dest: TARGET_MIN,
      },
    },
    eslint: {
      target: SOURCES,
      options: {
        configFile: '.eslintrc.json',
      },
    },
    clean: {
      all: [BUILD_DIR, DOC_DIR],
      doc: [DOC_DIR],
    },
    webpack: {
      build: webpackCommon,
      watch: Object.assign({}, webpackCommon, {
        watch: true,
        keepalive: true,
        watchDelay: 0,
      }),
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false,               // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false,   // Optionally clear the require cache before running tests (defaults to false)
          require: 'babel-register',
        },
        src: TEST_SOURCES,
      },
    },
    jsdoc: {
      dist: {
        src: ['src/*.js', 'tests/*.js', 'README.md'],
        options: {
          destination: DOC_DIR,
        },
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  // grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-qunit');
  // grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-contrib-docco');
  // grunt.loadNpmTasks('grunt-release');
  // grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');

  // Default task(s).
  grunt.registerTask('default', ['eslint', 'webpack:build', 'uglify:build']);
  grunt.registerTask('test', ['clean:all', 'eslint', 'webpack:build', 'mochaTest']);
  grunt.registerTask('doc', ['clean:doc', 'jsdoc']);
};
