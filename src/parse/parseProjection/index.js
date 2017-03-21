function parseProjection(line, i, lineNumber) {
  return line.slice(i, lineNumber);
}

module.exports = parseProjection;
