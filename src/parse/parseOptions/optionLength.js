var parseOptionParam = require('./parseOptionParam');

function optionLength(s, options) {
  options['length'] = true;
  return options;
}

module.exports = optionLength;