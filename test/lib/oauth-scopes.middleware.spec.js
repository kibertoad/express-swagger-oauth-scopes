const express = require("express");

const request = require("supertest");
const assert = require("chai").assert;

const appHelper = require("../helpers/test.app.helper");
require("../helpers/test.bootstrap");

describe("oauth-scopes.middleware", () => {
  let app;
  before(() => {
    app = express();
    app.use("/", require("../controllers/test.controller"));

    app.use((err, req, res, next) => {
      res.status(500).json({ details: err.message });
    });

    return appHelper.launchApp(app);
  });

  it("accepts if scopes are exact match for root endpoint", () => {
    return request(app)
      .get("/")
      .query({
        scopes: ["read:root"]
      })
      .expect(200);
  });

  it("accepts if scopes are exact match for non-root endpoint", () => {
    return request(app)
      .get("/doc")
      .query({
        scopes: ["read:doc"]
      })
      .expect(200);
  });

  it("supports explicit mapping of middleware to path", () => {
    return request(app)
      .get("/doc-explicit")
      .query({
        scopes: ["read:doc"]
      })
      .expect(200);
  });

  it("accepts if user has excessive scopes", () => {
    return request(app)
      .get("/")
      .query({
        scopes: ["dummy", "read:root", "dummier"]
      })
      .expect(200);
  });

  it("rejects if user has no scopes", () => {
    return request(app)
      .get("/")
      .expect(500);
  });

  it("rejects if user has wrong scopes", () => {
    return request(app)
      .get("/")
      .query({
        scopes: ["write:root"]
      })
      .expect(500);
  });

  it("throws an error if endpoint has no defined swagger entry", done => {
    request(app)
      .get("/wrong")
      .query({
        scopes: ["write:root"]
      })
      .expect(500)
      .then(response => {
        assert.equal(response.body.details, "No Swagger entry for GET /wrong");
        done();
      });
  });
});
