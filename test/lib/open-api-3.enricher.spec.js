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
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      },
      components: {
        securitySchemes: {
          oauth: {
            type: "oauth2",
            flows: {
              implicit: {
                authorizationUrl: "http://api.example.com/api/auth",
                scopes: {
                  "read:root": "read permissions for root endpoint",
                  "read:doc": "read permissions for doc endpoint"
                }
              }
            }
          }
        }
      }
    });
  });

  it("adds OpenAPI 3.0 security definitions with tokenUrl to a document", () => {
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
      "https://example.com/oauth/authorize",
      "https://example.com/oauth/token",
      "authorizationCode",
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
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      },
      components: {
        securitySchemes: {
          oauth: {
            type: "oauth2",
            flows: {
              authorizationCode: {
                authorizationUrl: "https://example.com/oauth/authorize",
                scopes: {
                  "read:root": "read permissions for root endpoint",
                  "read:doc": "read permissions for doc endpoint"
                },
                tokenUrl: "https://example.com/oauth/token"
              }
            }
          }
        }
      }
    });
  });
});
