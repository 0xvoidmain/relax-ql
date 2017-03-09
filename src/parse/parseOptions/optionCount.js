var parseOptionParam = require('./parseOptionParam');

function optionCount(s, options) {
  options['count'] = true;
  return options;
}

module.exports = optionCount;