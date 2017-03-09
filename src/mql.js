var deep = require('deep-obj');
var _ = require('lodash');
var parse = require('./parse');
var utils = require('./utils');
var MODELS = { mql: require('./mqlUtils') };
var CONVERTERS = require('./converters');

function tryGetValue(paramNames, params, data) {
  paramNames = utils.isParam(paramNames) ? utils.getParamName(paramNames) : paramNames;
  var parseParams = deep.parse(paramNames);
  var value = deep.get(params, paramNames);
  if ((value === null || value === undefined) && data)  {
    var metadata = data.$$meta ? data.$$meta() : null;

    while(parseParams[0] !== 'this' &&
      metadata && metadata.mql.name !== parseParams[0] &&
      metadata.parent && metadata.parent.$$meta)
    {
      data = metadata.parent;
      metadata = data.$$meta();
    }
    value = deep.get(data, parseParams.slice(1));
  }
  return value;
}

function insteadParam(data, obj, params) {
  var result = obj;
  if (typeof obj == 'string' && utils.isParam(obj)) {
     return tryGetValue(obj, params, data);;
  }
  else if (_.isPlainObject(obj)) {
    result = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
      if (utils.isParam(obj[key])) {
        result[key] = tryGetValue(obj[key], params, data);
      }
      else {
        result[key] = obj[key];
      }
      result[key] = insteadParam(data, result[key], params);
    }
  }
  else {
    return obj;
  }

  return result;
}

function appendOptions(options, mongoQuery, params) {
  if (options.limit != null && options.limit != undefined && mongoQuery.limit) {
    mongoQuery = mongoQuery.limit(options.limit);
  }

  if (options.skip != null && options.skip != undefined && mongoQuery.skip) {
    mongoQuery = mongoQuery.skip(options.skip);
  }

  if (Array.isArray(options.sort) && mongoQuery.sort) {
    var sort = {};
    options.sort.forEach((e) => {
      sort[e.fieldName] = e.type;
    });
    mongoQuery = mongoQuery.sort(sort);
  }

  return mongoQuery;
}

function recursiveBuildSelectField(fields, preKey, result) {
  if (!fields) {
    return result;
  }
  _.forEach(fields, (e, key) => {
    if (_.isObject(e)) {
      if (e.projection || e.selection) {
        result[preKey + key] = e.projection || e.selection;
      }
      if (!e.query) {
        recursiveBuildSelectField(e.fields, preKey + key + '.', result);
      }
    }
    else {
      result[preKey + key] = e;
    }
  });
  return result;
}

function buildSelectFields(mql, data, params) {
  var selectFields = recursiveBuildSelectField(mql, '', {});
  if (Object.keys(selectFields).length === 0) {
    selectFields = undefined;
  }
  return selectFields;
}

function buildQuery(result, mql, params) {
  if (mql.query && mql.query.model) {
    var selectFields = buildSelectFields(mql.fields, result, params);
    var query = insteadParam(result, mql.query, params);
    if (!MODELS[query.model]) {
      return new Promise((resolve, reject) => {
        reject(new Error(`Cannot find model ${query.model}`));
      });
    }
    if (!MODELS[query.model][query.method]) {
      return new Promise((resolve, reject) => {
        reject(new Error(`Cannot find method ${query.method} of model ${query.model}`));
      });
    }

    var method = MODELS[query.model][query.method](query.argument || undefined, selectFields);
    method = appendOptions(query.options, method, params);
    method = method.lean ? method.lean() : method;
    method = method.exec ? method.exec() : method;
    return new Promise((resolve, reject) => {
      method.then(data => resolve({
        data: data,
        query: query
      }))
      .catch(err => reject(err));
    });
  }
  return new Promise((resolve, reject) => {
    resolve({
      data: {},
      query: null
    });
  });
}


function tryExecFunction(query, data) {
  if (query && query.options.convert) {
    var convertNames = query.options.convert;
    for (var i = 0; i < convertNames.length; i++) {
      var converter = CONVERTERS[convertNames[i].name];
      if (converter) data = converter(data, convertNames[i].arg);
      else throw new Error(`Cannot find converter ${convertNames[i].name}`);
    }
  }
  return data;
}

function mergeResult(result, mql, data) {
  if (mql.query) {
    if (mql.name == '*') {
      if (_.isNil(data)) {
        var metadata = result.$$meta();
        var parent = metadata.parent;
        var pResult = parent[metadata.mql.name];
        if (_.isArray(pResult)) {
          pResult[metadata.index] = null;
        }
        else {
          delete parent[metadata.mql.name];
        }
      }
      else {
        result = Object.assign(result, data);
        Object.defineProperty(result, '*', { enumerable: false, writable: false, value: result });
      }
    }
    else {
      result[mql.name] = data;
    }
  }

  return data;
}

function initResult(result, mql, re, i) {
  var primaryRe = re;
  if (!_.isPlainObject(re)) {
    re = {};
    if (_.isArray(result[mql.name])) {
      result[mql.name][i] = re;
    }
    else {
      result[mql.name] = re;
    }
  }
  Object.defineProperty(re, '$$value', { enumerable: false, writable: false, value: primaryRe });
  re.$$meta = () => ({
    mql: mql,
    parent: result,
    me: re,
    index: i
  });

  return re;
}

function mongoQuery(result, mql, params) {
  return () => {
    return buildQuery(result, mql, params)
      .then(({data, query}) => tryExecFunction(query, data))
      .then((data) => mergeResult(result, mql, data))
      .then((data) => {
        if (!data) return;
        var promises = [];
        var likeArray = _.isArray(result[mql.name]) ? result[mql.name] : [result[mql.name]];
        likeArray.forEach((re, i) => {
          var seriesFunc = [];
          var lastFunc = null;
          _.filter(mql.fields, e => _.isObject(e))
          .forEach((populate) => {
            re = initResult(result, mql, re, i);

            if (populate.name == '*') {
              lastFunc = mongoQuery(re, populate, params);
            }
            else {
              seriesFunc.push(mongoQuery(re, populate, params));
            }
          });
          if (mql.execParallel) {
            promises.push(
              Promise.all(seriesFunc.map(func => func()))
                .then(() => lastFunc && lastFunc())
            )
          }
          else {
            promises.push(
              seriesFunc.reduce((a, e) => a.then(() => e()), Promise.resolve())
                .then(() => lastFunc && lastFunc())
            );
          }
        });
        return Promise.all(promises);
      });
  };
}

function execMQL(query, params) {
  console.log(JSON.stringify(query, null, 4));
  var result = {};
  return mongoQuery(result, query, params)()
    .then(() => {
        if (Object.keys(result).length === 1 && result.$$root) {
          result = result.$$root;
        }
        return result;
    });
}

function relaxQL(s, args) {
  if (Array.isArray(s)) {
    s = utils.join(s);
    args = Array.prototype.slice.call(arguments, 1);
  }
  args = args || {};
  var template = parse(s);
  return {
    template: template,
    args: args,
    exec: (callback) => {
      if (callback) {
        execMQL(template, args)
          .then(data => callback(null, data))
          .catch(err => callback(err));
      }
      else {
        return execMQL(template, args);
      }
    }
  };
}

relaxQL.init = function (config) {
  MODELS = Object.assign(MODELS, config.models);
  CONVERTERS = Object.assign(CONVERTERS, config.converters || {});
};

module.exports = relaxQL;