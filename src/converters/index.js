module.exports = {
  bool(v) { return !!v; },
  string(v) { return v.toString(); },
  float(v) { return parseFloat(v) },
  int(v) { return parseInt(v); },
  eString(v) {
    return v.map(e => e.toString())
  },
  eWrap(v) {
    return v.map(e => ({
      $$value: () => e
    }));
  },
  cleanArr(v) {
    return v.filter(e => e);
  }
}