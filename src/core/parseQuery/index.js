var parseOptions = require('../parseOptions');
var parseArgument = require('../parseArgument');

function parseQuery(line, i, lineNumber) {
  var MODEL = 1;
  var ARGUMENT = 2;
  var OPTIONS = 3;
  var METHODS = 4;

  var methodSymbol = '';
  var method = '';
  var model = '';
  var argument = '';
  var options = '';
  var state = MODEL;
  var stack = [];

  for (; i < line.length; i++) {
    var c = line[i];
    if (state !== ARGUMENT && (c === ' ' || c === '\t')) continue;

    if (c === '(' || c === '[') stack.push(c);
    else if (c === ')' && stack[stack.length - 1] === '(') stack.pop();
    else if (c === ']' && stack[stack.length - 1] === '[') stack.pop();

    if (state === MODEL) {
      if (c === '(') { state = ARGUMENT; methodSymbol = 'find'; }
      else if (c === '[') { state = ARGUMENT; methodSymbol = 'findOne'; }
      else if (c === '.') { state = METHODS; }
      else { model += c; }
    }
    else if (state === METHODS) {
      if (c === '(') { state = ARGUMENT; }
      else if (c === '[') { state = ARGUMENT; }
      else { method += c; }
    }
    else if (state === ARGUMENT) {
      if ((c === ')' || c === ']') && stack.length === 0) { state = OPTIONS; }
      else { argument += c; }
    }
    else if (state === OPTIONS) {
      options += c;
    }
  }

  if (stack.length > 0) {
    throw new Error(`Syntax error: Missing ) or ] at line ${lineNumber}: ${line}`);
  }
  try {
    var result = {
      model: model,
      method: method || methodSymbol,
      argument: parseArgument(argument, methodSymbol == 'findOne'),
      options: parseOptions(options)
    };

    return result;
  }
  catch (ex) {
    throw new Error(`${ex.message} - at line ${lineNumber}: ${line}`);
  }
}

module.exports = parseQuery;
