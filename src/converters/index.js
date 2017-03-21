module.exports = {
  bool(v) { return !!v; },
  string(v) { return v.toString(); },
  float(v) { return parseFloat(v); },
  int(v) { return parseInt(v); },
  cleanArr(v) { return v.filter(e => e); }
};
