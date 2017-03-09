var parseOptionParam = require('./parseOptionParam');

function optionASC(s, options) {
  var value = parseOptionParam(s);
  var sort = options['sort'] || {};
  sort[value] = 1;
  options.sort = sort;
  return options;
}

module.exports = optionASC;