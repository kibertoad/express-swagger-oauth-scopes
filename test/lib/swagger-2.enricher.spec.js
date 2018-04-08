const assert = require("chai").assert;
const swaggerEnricher = require("../../lib/swagger-2.enricher");

describe("oauth-scopes.middleware", () => {
  it("adds OAuth 2.0 security definitions to a document without any", () => {
    const swaggerDocument = {
      swagger: "2.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      }
    };
    swaggerEnricher.enrichWithSecurityDefinitions(
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
      swagger: "2.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      },
      securityDefinitions: {
        oauth: {
          type: "oauth2",
          authorizationUrl: "http://api.example.com/api/auth",
          flow: "implicit",
          scopes: {
            "read:root": "read permissions for root endpoint",
            "read:doc": "read permissions for doc endpoint"
          }
        }
      }
    });
  });

  it("adds OAuth 2.0 security definitions with tokenUrl to a document", () => {
    const swaggerDocument = {
      swagger: "2.0",
      info: {
        version: "1.0.0",
        title: "Security Test",
        license: {
          name: "MIT"
        }
      }
    };
    swaggerEnricher.enrichWithSecurityDefinitions(
      swaggerDocument,
      "https://example.com/oauth/authorize",
      "https://example.com/oauth/token",
      "accessCode ",
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
          "authorizationUrl": "https://example.com/oauth/authorize",
          "flow": "accessCode ",
          "scopes": {
            "read:root": "read permissions for root endpoint",
            "read:doc": "read permissions for doc endpoint"
          },
          "tokenUrl": "https://example.com/oauth/token"
        }
      }
    });
  });
});
