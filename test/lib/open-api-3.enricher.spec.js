const assert = require("chai").assert;
const openApiEnricher = require("../../lib/open-api-3.enricher");

describe("oauth-scopes.middleware", () => {
  it("adds OpenAPI 3.0 security definitions to a document without any", () => {
    const swaggerDocument = {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      }
    };
    openApiEnricher.enrichWithSecurityDefinitions(
      swaggerDocument,
      "http://api.example.com/api/auth",
      null,
      "implicit",
      [
        {
          name: "read:root",
          description: "read permissions for root endpoint"
        },
        {
          name: "read:doc",
          description: "read permissions for doc endpoint"
        }
      ]
    );

    assert.deepEqual(swaggerDocument, {
      components: {
        securitySchemes: {
          oauth: {
            authorizationUrl: "http://api.example.com/api/auth",
            flow: "implicit",
            scopes: {
              "read:doc": "read permissions for doc endpoint",
              "read:root": "read permissions for root endpoint"
            },
            type: "oauth2"
          }
        }
      },
      info: {
        license: {
          name: "MIT"
        },
        title: "Security Test",
        version: "1.0.0"
      },
      openapi: "3.0.0"
    });
  });
});
