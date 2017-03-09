var parseOptionParam = require('./parseOptionParam');
var utils = require('../../utils');

function optionSkip(s, options) {
  options['skip'] = parseOptionParam(s);
  return options;
}

module.exports = optionSkip;