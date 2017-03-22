const utils = require('../../utils');

const ProjectionOperators = {
  'slice': '$slice',
  'SLICE': '$slice',
  'size': '$',
  'SIZE': '$',
  'match': '$elemMatch',
  'MATCH': '$elemMatch',
  'meta': '$meta',
  'META': '$meta'
}
function parseProjection(line, i, n, lineNumber) {
  var projectionString = line.slice(i + 1, n);
  var ps = projectionString.split(',').map(e => e.trim()).filter(e => e);
  var result = {};
  if (ps.length == 1 && utils.isParam(ps[0])) {
    return ps[0];
  }
  for (var i = 0; i < ps.length; i++) {
    var e = ps[i];
    var s = e.split(':').map(e => e.trim());
    if (s.length == 1) {
      return utils.tryParseValue(s[0]);
    }
    else {
      if (ProjectionOperators[s[0]]) {
        result[ProjectionOperators[s[0]]] = utils.tryParseValue(s[1])
      }
      else {
        throw new Error(`Not support projection ${s[0]} at line: ${lineNumber}`);
      }
    }
  }
  if (Object.keys(result).length == 0) {
    return undefined;
  }
  return result;
}

module.exports = parseProjection;
