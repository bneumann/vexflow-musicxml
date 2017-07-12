const path = require('path');
const webpack = require('webpack');
const webpackCfg = require('./webpack.config.js');

module.exports = (grunt) => {
  const BANNER = [
    '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */',
  ].join('\n');

  const BASE_DIR = __dirname;
  const BUILD_DIR = path.join(BASE_DIR, 'build');
  const DOC_DIR = path.join(BASE_DIR, 'doc');
  const MODULE_ENTRY = path.join(BASE_DIR, 'src/index.js');
  const ALL_ENTRIES = path.join(BASE_DIR, 'src/index.js');
  const WP_SERVER_ENTRIES = path.join(BASE_DIR, 'src/index.html');
  const TARGET_RAW = 'vexflow-musicxml.js';
  const TARGET_MIN = 'vexflow-musicxml-min.js';
  const TARGET_TESTS = 'vexflow-musicxml-tests.js';

  const SOURCES = ['src/*.js'];
  const TEST_SOURCES = ['tests/*.js', 'tests/parser/*.js', 'tests/testdata/mock/*.xml', 'tests/*.html'];

  function webpackConfig(config) {
    return {
      entry: config.entry,
      output: {
        path: BUILD_DIR,
        publicPath: 'assets',
        filename: config.target,
        library: config.library,
        libraryTarget: 'umd',
      },
      devtool: 'source-map',
      module: {
        loaders: [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
              presets: [config.preset],
              'plugins': ['add-module-exports', 'transform-object-assign'],
            },
          },
        ],
      },
      plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //   sourceMap: true,
        // }),
      ],
    };
  }
  const webpackTest = webpackConfig({
    entry: MODULE_ENTRY,
    target: TARGET_TESTS,
    library: 'Vex.Flow.MusicXml',
    preset: 'es2015',
  });

  const webpackAll = webpackConfig({
    entry: ALL_ENTRIES,
    target: TARGET_RAW,
    library: 'Vex',
    preset: 'es2015',
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      dev: {
        files: [SOURCES, 'tests/*.html'],
        tasks: ['fast'],
      },
      test: {
        files: [TEST_SOURCES],
        tasks: ['test'],
      },
      meteor: {
        files: [TEST_SOURCES, SOURCES],
        tasks: ['meteor'],
      },
    },
    uglify: {
      options: {
        banner: BANNER,
        sourceMap: true,
      },
      build: {
        src: path.resolve(BUILD_DIR, TARGET_RAW),
        dest: path.resolve(BUILD_DIR, TARGET_MIN),
      },
    },
    eslint: {
      target: SOURCES,
      options: {
        configFile: '.eslintrc.json',
      },
    },
    clean: {
      all: [BUILD_DIR, 'doc/*', '!doc/images/**'],
      doc: ['doc/*', '!doc/images/**'],
      options: {'no-write': false}
    },
    webpack: {
      test: webpackTest,
      all: webpackAll,
      watch: Object.assign({}, webpackAll, {
        watch: true,
        keepalive: true,
      }),
    },
    webpack_server: {
      options: {
        stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      },
      prod: webpackCfg,
      dev: Object.assign({ watch: true }, webpackCfg)
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file
          quiet: false,               // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false,   // Optionally clear the require cache before running tests (defaults to false)
          require: 'babel-register',
          recursive: true,
        },
        src: ['tests/run.js'],
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
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-webpack-server');

  // Default task(s).
  grunt.registerTask('default', ['eslint', 'webpack:all', 'uglify:build', 'doc']);
  grunt.registerTask('test', ['clean:all', 'eslint', 'webpack:test', 'mochaTest', 'doc']);
  grunt.registerTask('meteor', ['clean:all', 'eslint', 'webpack:test', 'mochaTest', 'webpack:all', 'doc']);
  grunt.registerTask('fast', ['webpack:all']);
  grunt.registerTask('doc', ['clean:doc', 'jsdoc']);
};
