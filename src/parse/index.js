var utils = require('../utils');
var parseQuery = require('./parseQuery');
var parseProjection = require('./parseProjection');

function fieldDefault(level) {
  return {
    level: level,
    name: '',
    query: null,
    projection: true,
    selection: false,
    fields: {}
  };
}

function clean(e) {
  if (Object.keys(e.fields).length === 0) {
    delete e.fields;
  }
  if (!e.query || (!e.query.model && !e.query.method)) {
    delete e.query;
  }
  else {
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
  var currentQuery = null;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line.trim()) {
      if (i === 0) {
        currentQuery = fieldDefault(0);
        currentQuery.name = '$$root';
      }
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
      if (c === ':') {
        if (line[j + 1] === '=') {
          currentQuery.selection = true;
          query = parseQuery(line, j + 2, i);
        }
        else {
          query = parseQuery(line, j + 1, i);
        }
        break;
      };
      if (c === '(') {
        projection = parseProjection(line, j, i);
        break;
      }
      s += c;
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

  if (currentQuery.name === '$$root' && Object.keys(currentQuery.fields).length === 1) {
    currentQuery = currentQuery.fields[Object.keys(currentQuery.fields)[0]];
  }
  return clean(currentQuery);
}

module.exports = parseTemplate;