module.exports = {
  middleware: require("./lib/oauth-scopes.middleware"),
  openApi3Enricher: require("./lib/open-api-3.enricher"),
  swagger2Enricher: require("./lib/swagger-2.enricher")
};
