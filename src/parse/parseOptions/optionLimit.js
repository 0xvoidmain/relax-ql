var parseOptionParam = require('./parseOptionParam');

function optionLimit(s, options) {
  options['limit'] = parseOptionParam(s);
  return options;
}

module.exports = optionLimit;
