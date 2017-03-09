var parseOptionParam = require('./parseOptionParam');
var utils = require('../../utils');

function optionLimit(s, options) {
  options['limit'] = parseOptionParam(s);
  return options;
}

module.exports = optionLimit;