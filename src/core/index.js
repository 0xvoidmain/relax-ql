var utils = require('../utils');
var parseQuery = require('./parseQuery');
var parseProjection = require('./parseProjection');

function fieldDefault(level) {
  return {
    level: level,
    name: '',
    query: null,
    projection: null,
    fields: {}
  };
}

function clean(e) {
  if (!e.fields || Object.keys(e.fields).length === 0) {
    delete e.fields;
  }
  if (!e.query || (!e.query.model && !e.query.method)) {
    delete e.query;
  }
  if (!e.projection) {
    delete e.projection;
  }
  if (!e.query && !e.fields)
  {
    return e.projection;
  }
  return e;
}

function parseTemplate(template) {
  var lines = utils.splitLines(template);

  var ll = { level: 1, currentIndentSize: -1, indentLineLevel: {} };
  var stackQueries = [];
  var parentQuery = null;
  var currentQuery = fieldDefault(0);
  currentQuery.name = '$$root';
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line.trim()) {
      continue;
    }

    ll = utils.lineLevel(i, line, ll);
    if (!currentQuery) {
      currentQuery = fieldDefault(ll.level);
    }
    else {
      if (ll.level > currentQuery.level) {
        stackQueries.push(currentQuery);
        parentQuery = currentQuery;
      }
      else if (ll.level === currentQuery.level) {
        if (parentQuery) parentQuery.fields[currentQuery.name] = clean(currentQuery);
      }
      else {
        while (ll.level < currentQuery.level) {
          if (parentQuery) parentQuery.fields[currentQuery.name] = clean(currentQuery);
          currentQuery = stackQueries.pop();
          parentQuery = stackQueries[stackQueries.length - 1];
          if (parentQuery) parentQuery.fields[currentQuery.name] = clean(currentQuery);
        }
      }
      currentQuery = fieldDefault(ll.level);
    }


    var s = '';
    var query = null;
    var projection = true;
    for (var j = 0; j < line.length; j++) {
      var c = line[j];
      if (c === ' ' || c === '\t') continue;
      else if (c === ':') {
        if (line[j + 1] === '=') {
          projection = projection || true;
          query = parseQuery(line, j + 2, i);
        }
        else {
          query = parseQuery(line, j + 1, i);
          projection = false;
        }
        break;
      }
      else if (c === '(') {
        var start = j;
        for (j; j < line.length && line[j] !== ')'; j++);
        projection = parseProjection(line, start, j, i);
      }
      else {
        s += c;
      }
    }

    currentQuery.name = s;
    currentQuery.query = query;
    currentQuery.projection = projection;
  }

  while (stackQueries.length > 0) {
    parentQuery = stackQueries.pop();
    parentQuery.fields[currentQuery.name] = clean(currentQuery);
    currentQuery = parentQuery;
  }

  return clean(currentQuery);
}

module.exports = parseTemplate;
