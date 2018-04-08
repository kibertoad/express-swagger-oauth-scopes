const assert = require("chai").assert;
const swaggerEnricher = require('../../lib/swagger-2.enricher');

describe("oauth-scopes.middleware", () => {
	it("adds OAuth 2.0 security definitions to a document without any", () => {
		const swaggerDocument = {
			"swagger": "2.0",
			"info": {
				"version": "1.0.0",
				"title": "Security Test",
				"license": {
					"name": "MIT"
				}
			},
		};
		swaggerEnricher.enrichWithSecurityDefinitions(swaggerDocument, "http://api.example.com/api/auth", "implicit", [
			{
				name: 'read:root',
				description: 'read permissions for root endpoint'
			},
			{
				name: 'read:doc',
				description: 'read permissions for doc endpoint'
			},
		]);

		assert.deepEqual(swaggerDocument, {
			"swagger": "2.0",
			"info": {
				"version": "1.0.0",
				"title": "Security Test",
				"license": {
					"name": "MIT"
				}
			},
			"securityDefinitions": {
				"oauth": {
					"type": "oauth2",
					"authorizationUrl": "http://api.example.com/api/auth",
					"flow": "implicit",
					"scopes": {
						"read:root": "read permissions for root endpoint",
						"read:doc": "read permissions for doc endpoint"
					}
				}
			},
		});
	});
});
