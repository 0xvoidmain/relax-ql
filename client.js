var parse = require('./src/parse');
var utils = require('./src/utils');
var configUrl = null;
var requestFunc = null;
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
      if (typeof requestFunc !== 'function') {
        throw new Error('Can not exec because you have been set requestFunc');
      }
      if (typeof url === 'function') {
        callback = url;
        url = configUrl;
      }
      if (callback) {
        requestFunc && requestFunc(url, template, args, callback);
      }
      else {
        return requestFunc && requestFunc(url, template, args);
      }
    }
  };
}

relaxQL.init = function(config) {
  configUrl = config.url;
  requestFunc = config.requestFunc;
};

module.exports = relaxQL;
