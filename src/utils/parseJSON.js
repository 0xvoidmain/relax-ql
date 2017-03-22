function parseJSON(data) {
  if (typeof data !== "string" || !data) {
    return {};
  }
  var dr = data
    .replace(/([\$\w]+)\s*:/g, (_, $1) => '"'+$1+'":')
    .replace(/'([^']+)'/g, (_, $1) => '"'+$1+'"')
  try {
    return JSON.parse(dr)
  }
  catch (ex) {
    return {};
  }
}

module.exports = parseJSON;