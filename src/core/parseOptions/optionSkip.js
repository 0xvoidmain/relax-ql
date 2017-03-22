var parseOptionParam = require('./parseOptionParam');

function optionSkip(s, options) {
  options['skip'] = parseOptionParam(s);
  return options;
}

module.exports = optionSkip;
