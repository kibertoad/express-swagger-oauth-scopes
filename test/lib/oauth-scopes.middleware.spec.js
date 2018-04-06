const express = require("express");

const request = require("supertest");
const assert = require("chai").assert;

const appHelper = require("../helpers/test.app.helper");
require("../helpers/test.bootstrap");

describe("GET /", () => {
  let app;
  before(async () => {
    app = express();
    app.use("/", require("../controllers/test.controller"));

    app.use((err, req, res, next) => {
      res.status(500).json({ details: err.message });
    });

    await appHelper.launchApp(app);
  });

  it("accepts if scopes are exact match for root endpoint", async () => {
    await request(app)
      .get("/")
      .query({
        scopes: ["read:root"]
      })
      .expect(200);
  });

  it("accepts if scopes are exact match for non-root endpoint", async () => {
    await request(app)
      .get("/doc")
      .query({
        scopes: ["read:doc"]
      })
      .expect(200);
  });

  it("accepts if user has excessive scopes", async () => {
    await request(app)
      .get("/")
      .query({
        scopes: ["dummy", "read:root", "dummier"]
      })
      .expect(200);
  });

  it("rejects if user has no scopes", async () => {
    await request(app)
      .get("/")
      .expect(500);
  });

  it("rejects if uas has wrong scopes", async () => {
    await request(app)
      .get("/")
      .query({
        scopes: ["write:root"]
      })
      .expect(500);
  });

  it("throws an error if endpoint has no defined swagger entry", async () => {
    const response = await request(app)
      .get("/wrong")
      .query({
        scopes: ["write:root"]
      })
      .expect(500);
    assert.equal(response.body.details, "No Swagger entry for GET /wrong");
  });
});
