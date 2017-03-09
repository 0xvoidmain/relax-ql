var parse = require('./src/parse');
var utils = require('./src/utils');
var configUrl = null;

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
    exec: (url, callback) => {
      if (typeof url == 'function') {
        callback = url;
        url = configUrl;
      }
      if (callback) {
        requestFunc(url, template, args, callback);
      }
      else {
        return requestFunc(url, template, args);
      }
    }
  };
}

relaxQL.init = function(config) {
  configUrl = config.url;
  requestFunc = config.requestFunc;
}

module.exports = relaxQL;
