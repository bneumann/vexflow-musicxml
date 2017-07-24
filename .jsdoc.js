const path = require('path');

module.exports = {
  plugins: [],
  recurseDepth: 10,
  source: {
      include:[ path.join(__dirname, 'src/*') ],
      exclude:[ path.join(__dirname, 'tests') ],
      includePattern: '.+\\.js(doc|x)?$',
      excludePattern: '(^|\\/|\\\\)_'
  },
  sourceType: 'module',
  tags: {
      allowUnknownTags: true,
      dictionaries: ['jsdoc','closure']
  },
  templates: {
      cleverLinks: false,
      monospaceLinks: false
    }
};
