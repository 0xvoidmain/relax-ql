function isObject(o) {
  if (o == undefined || o == null) {
    return false;
  }
  if (typeof o == 'object') {
    return true;
  }
}
function indentSize(line) {
  var count = 0;
  for (var i = 0; i < line.length; i++) {
    if (line[i] === ' ' || line[i] === '\t') {
      count++;
    }
    else {
      return count;
    }
  }
}

function splitLines(s) {
  return s.split('\n');
}

function paramFormat(paramName) {
  return `$${paramName}`
}

function isParam(s) {
  return s && s[0] == '$';
}

function getParamName(s) {
  if (s[0] == '$') {
    return s.slice(1);
  }
  return s;
}

function join(strings) {
  var result = '';
  var i = 0;
  var n = strings.length - 1;
  for (; i < n; i++) {
    result += strings[i] + paramFormat(i);
  }
  result += strings[i];
  return result;
}

function lineLevel(i, line, ll) {
  if (ll.currentIndentSize === -1) {
    ll.currentIndentSize = indentSize(line);
    ll.indentLineLevel[ll.currentIndentSize] = ll.level;
  }
  else {
    var indentSizeOfLine = indentSize(line);
    if (ll.indentLineLevel[indentSizeOfLine] >= 0) {
      ll.level = ll.indentLineLevel[indentSizeOfLine];
      ll.currentIndentSize = indentSizeOfLine;
    }
    else if (indentSizeOfLine > ll.currentIndentSize) {
      ll.level += 1;
      ll.currentIndentSize = indentSizeOfLine;
      ll.indentLineLevel[ll.currentIndentSize] = ll.level;
    }
    else if (indentSizeOfLine < ll.currentIndentSize) {
      throw new Error(`Indent is invalide at line ${i}: ${line}`);
    }
  }
  return ll;
}

function clone(o) {
  // return JSON.parse(JSON.stringify(o));
  var newO;
  var i;

  if (typeof o !== 'object') return o;
  if (!o) return o;

  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < o.length; i += 1) {
      newO[i] = clone(o[i]);
    }
    return newO;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = clone(o[i]);
    }
  }
  return newO;
}

module.exports = {
  indentSize: indentSize,
  splitLines: splitLines,
  join: join,
  lineLevel: lineLevel,
  clone: clone,
  paramFormat: paramFormat,
  isParam: isParam,
  getParamName: getParamName,
  isObject: isObject
};