var utils = require('../../utils');

function parseOptionParam(s) {
  var stack = [];
  var isParam = false;
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

  if (utils.isParam(value)) {
    return utils.paramFormat(value)
  }
  else {
    var number = parseFloat(value);
    if (isNaN(number)) return value;
    return number;
  }
}

module.exports = parseOptionParam;