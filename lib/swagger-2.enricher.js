/**
 * Map of ids for entities related to order
 * @typedef {Object} ScopeWrapper
 * @property {name} name - name of a permission
 * @property {string} [description] - description of a permission
 */

/**
 * Fill securityDefinitions entry for a given Swagger 2.0 specification document. Mutates state
 * @param {Object} swaggerDocument
 * @param {string} authorizationUrl - url used for authorization
 * @param {string} [tokenUrl] - url used for retrieving token
 * @param {string} flow - used OAuth flow
 * @param {ScopeWrapper[]} scopeWrappers - array of permissions that are supported by the system
 */
function enrichWithSecurityDefinitions(
  swaggerDocument,
  authorizationUrl,
  tokenUrl,
  flow,
  scopeWrappers
) {
  const scopes = scopeWrappers.reduce((result, scope) => {
    result[scope.name] = scope.description ? scope.description : "-";
    return result;
  }, {});

  if (!swaggerDocument.securityDefinitions) {
    swaggerDocument.securityDefinitions = {};
  }
  if (!swaggerDocument.securityDefinitions.oauth) {
    swaggerDocument.securityDefinitions.oauth = {
      type: "oauth2",
      authorizationUrl,
      flow,
      scopes
    };
  }

  if (tokenUrl) {
    swaggerDocument.securityDefinitions.oauth.tokenUrl = tokenUrl;
  }
}

module.exports = {
  enrichWithSecurityDefinitions
};
