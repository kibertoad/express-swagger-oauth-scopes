/**
 * Fill securityDefinitions entry for a given Swagger 2.0 specification document. Mutates state
 * @param {Object} swaggerDocument
 * @param {string} authorizationUrl - url used for authorization
 * @param {string} flow - used OAuth flow
 * @param {object[]} scopeWrappers - array of permissions that are supported by the system
 * @param {string} scopeWrappers.name - name of a permission
 * @param {string} [scopeWrappers.description] - description of a permission
 */
function enrichWithSecurityDefinitions(swaggerDocument, authorizationUrl, flow, scopeWrappers) {
	const scopes = scopeWrappers.reduce((result, scope) => {
		result[scope.name] = scope.description ? scope.description : '-';
		return result;
	}, {});

	if (!swaggerDocument.securityDefinitions) {
		swaggerDocument.securityDefinitions = {};
	}
	if (!swaggerDocument.securityDefinitions.oauth) {
		swaggerDocument.securityDefinitions.oauth = {
			type: 'oauth2',
			authorizationUrl,
			flow,
			scopes
		};
	}
}

module.exports = {
	enrichWithSecurityDefinitions
};
