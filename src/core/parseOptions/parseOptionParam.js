var utils = require('../../utils');

function parseOptionParam(s) {
  var stack = [];
  var value = '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (c === ' ' || c === '\t') continue;
    if (c === '(' || c === '[') stack.push(c);
    else if (c === ')') {
      if (stack.length > 0) {if (stack[stack.length - 1] === '(') stack.pop();}
      else throw new Error('Syntax error');
    }
    else value += c;
  }

  if (stack.length > 0) {
    throw new Error('Syntax error');
  }

  return utils.tryParseValue(value);
}

module.exports = parseOptionParam;
