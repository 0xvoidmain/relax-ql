var parseOptionParam = require('./parseOptionParam');

var optionParseMethod = {
  limit: require('./optionLimit'),
  asc: require('./optionASC'),
  desc: require('./optionDESC'),
  skip: require('./optionSkip'),
  unlean: require('./optionUnlean')
};

function parseOptions(s) {
  if (!s || !s.trim()) return {};
  var sOptions = s.split('.').filter(function(e) { return e; });
  var options = {};

  sOptions.forEach(function(sOption) {
    var i = sOption.indexOf('(');
    var optionName = i >= 0 ? sOption.slice(0, i) : sOption;
    var param = i >= 0 ? sOption.slice(i) : '';
    if (!optionName) throw new Error('Syntax error');
    if (optionParseMethod[optionName.toLowerCase()]) {
      options = optionParseMethod[optionName.toLowerCase()](param, options);
    }
    else {
      options['convert'] = options['convert'] || [];
      options['convert'].push({
        name: optionName,
        arg: parseOptionParam(param)
      });
    }
  });

  return options;
}

module.exports = parseOptions;
