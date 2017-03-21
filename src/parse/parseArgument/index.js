// var LOGICAL_OPERATORS = ['||', '&&'];
// var COMPARISON_OPERATORS = ['==', '!=', '<', '>', '>=', '<=', 'IN', 'NIN', 'ALL'];
// var ELEMENT_OPERATORS = ['TYPE', 'EXISTS'];
// var EVALUATION_OPERATORS = ['MOD', 'REGEX', 'TEXT', 'WHERE'];
// var ARRAY_OPERATORS = ['ALL', 'MATCH', 'SIZE'];
var utils = require('../../utils');

function tryGetOperation(s, j) {
  var defineO = {
    '==': 'eq',
    '!=': 'ne',
    '<': 'lt',
    '>': 'gt',
    '<=': 'lte',
    '>=': 'gte',
    'IN': 'in',
    'NIN': 'nin',
    'ALL': 'all',
    'in': 'in',
    'nin': 'nin',
    'all': 'all'
  };

  for (var i = 5; i >= 0; i--) {
    var k = s.slice(j, j + i).trim();
    var r = defineO[k];
    if (r) return [r, i - 1];
  }
  return null;
}

function parseArgument(s, autoId) {
  if (!s) {
    return s;
  }
  var and = s.split('&&').map(e => e.trim()).filter(e => e);
  var result = {};
  var startOpe = ' \t=!<>';
  for (var i = 0; i < and.length; i++) {
    var o = and[i];
    var a = '';
    var b = '';
    var ope = null;

    for (var j = 0; j < o.length; j++) {
      var c = o[j];
      if (!ope && startOpe.indexOf(c) >= 0) {
        var rc = tryGetOperation(o, j);
        if (rc) {
          ope = rc[0];
          j += rc[1];
          continue;
        }
      }
      else if (ope) {
        b += c;
      }
      else {
        a += c;
      }
    }
    a = a.trim();
    b = b.trim();
    if (!b) {
      if (autoId) {
        result['_id'] = utils.tryParseValue(a);
      }
      else {
        if (and.length > 1) {
          throw new Error(`Error: Cannot parse argument`);
        }
        return utils.tryParseValue(a);
      }
    }
    else {
      var size = a.slice(-5) == '.size';
      if (size) {
        a = a.slice(0, a.length - 5);
        if (ope == 'eq') result[a] = { $size: utils.tryParseValue(b) };
        else {
          result[a] = result[a] || {};
          if (!utils.isObject(result[a])) result[a] = { '$eq': result[a] };
          result[a]['$size'] = result[a]['$size'] || {};
          if (!utils.isObject(result[a]['$size'])) result[a]['$size'] = { '$eq': result[a]['$size'] };
          result[a]['$size']['$' + ope] = utils.tryParseValue(b);
        }
      }
      else {
        if (ope == 'eq') result[a] = utils.tryParseValue(b);
        else {
          result[a] = result[a] || {};
          if (!utils.isObject(result[a])) {
            result[a] = {
              '$eq': result[a]
            };
          }
          result[a]['$' + ope] = utils.tryParseValue(b);
        }
      }
    }
  }
  return result;
}

module.exports = parseArgument;
