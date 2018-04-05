let extractorFn;

function setExtractorFn(_extractorFn) {
  extractorFn = _extractorFn;
}

function getExtractorFn() {
  return extractorFn;
}

module.exports = {
  setExtractorFn,
  getExtractorFn
};
