/**
 * Map of ids for entities related to order
 * @typedef {Object} ScopeWrapper
 * @property {name} name - name of a permission
 * @property {string} [description] - description of a permission
 */

/**
 * Fill securityDefinitions entry for a given OpenAPI 3.0 specification document
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
    result[scope.name] = scope.description ? scope.description : '-';
    return result;
  }, {});

  if (!swaggerDocument.components) {
    swaggerDocument.components = {};
  }
  if (!swaggerDocument.components.securitySchemes) {
    swaggerDocument.components.securitySchemes = {};
  }
  if (!swaggerDocument.components.securitySchemes.oauth) {
    swaggerDocument.components.securitySchemes.oauth = {
      type: 'oauth2',
      flows: {
        [flow]: {
          authorizationUrl,
          scopes
        }
      }
    };
  }

  if (tokenUrl) {
    swaggerDocument.components.securitySchemes.oauth.flows[flow].tokenUrl = tokenUrl;
  }
}

module.exports = {
  enrichWithSecurityDefinitions
};
