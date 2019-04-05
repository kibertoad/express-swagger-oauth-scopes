const yaml = require('js-yaml')
const fs = require('fs')
const request = require('supertest')
const assert = require('chai').assert
const { newExpressApp } = require('middleware-testlab')

const swaggerFile = fs.readFileSync('test/swagger/swagger.yaml')
const swaggerDocument = yaml.safeLoad(swaggerFile)
const oauthScopes = require('../../lib/oauth-scopes.middleware')
const extractor = require('../extractors/simple.scopes.extractor')

describe('oauth-scopes.middleware', () => {
  it('accepts if scopes are exact match for root endpoint', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/'
    })

    return request(app)
      .get('/')
      .query({
        scopes: ['read:root']
      })
      .expect(204)
  })

  it('accepts if scopes are exact match for non-root endpoint', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/doc'
    })

    return request(app)
      .get('/doc')
      .query({
        scopes: ['read:doc']
      })
      .expect(204)
  })

  it('supports explicit mapping of middleware to path', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor, '/explicitly-doc'),
      endpoint: '/doc-explicit'
    })

    return request(app)
      .get('/doc-explicit')
      .query({
        scopes: ['read:doc']
      })
      .expect(204)
  })

  it('accepts if user has excessive scopes', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/'
    })

    return request(app)
      .get('/')
      .query({
        scopes: ['dummy', 'read:root', 'dummier']
      })
      .expect(204)
  })

  it('rejects if user has no scopes', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/'
    })

    return request(app)
      .get('/')
      .expect(500)
  })

  it('rejects if user has wrong scopes', () => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/'
    })

    return request(app)
      .get('/')
      .query({
        scopes: ['write:root']
      })
      .expect(500)
  })

  it('throws an error if endpoint has no defined swagger entry', done => {
    const app = newExpressApp({
      middleware: oauthScopes(swaggerDocument, extractor),
      endpoint: '/wrong'
    })

    request(app)
      .get('/wrong')
      .query({
        scopes: ['write:root']
      })
      .expect(500)
      .then(response => {
        assert.equal(response.body.details, 'No Swagger entry for GET /wrong')
        done()
      })
  })
})
