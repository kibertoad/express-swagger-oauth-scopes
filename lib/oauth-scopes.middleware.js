const validateScope = require("validate-scope");

const AuthorizationError = require("../lib/AuthorizationError");
const middlewareConfig = require("../lib/middleware.config");

const scopeValidators = {};

/**
 *
 * @param {Object} swaggerDocument - parsed Swagger specification
 * @param {function} [scopeExtractionFn] - function that will be invoked to extract scopes from request. Should return string[].
 *        If not specified, will be retrieved from global config (middleware.config.js)
 * @returns {*}
 */
function initNew(swaggerDocument, scopeExtractionFn) {
  if (!swaggerDocument) {
    throw new Error("swaggerDocument param is mandatory");
  }
  scopeExtractionFn = scopeExtractionFn || middlewareConfig.getExtractorFn();
  if (!scopeExtractionFn) {
    throw new Error("scopeExtractionFn param is mandatory");
  }

  function processRequest(req, res, next) {
    try {
      const method = req.method.toLowerCase();
      const path = extractPath(req);

      if (
        !swaggerDocument.paths[path] ||
        !swaggerDocument.paths[path][method]
      ) {
        return next(
          new Error(`No Swagger entry for ${method.toUpperCase()} ${path}`)
        );
      }
      const pathDescription = swaggerDocument.paths[path][method];

      const security = pathDescription.security;
      if (!security) {
        return next();
      }
      const oauth = security[0].oauth;

      //ToDo Replace with iteration over schema on initialization
      if (!scopeValidators[path]) {
        scopeValidators[path] = {};
      }
      if (!scopeValidators[path][method]) {
        scopeValidators[path][method] = validateScope(oauth);
      }
      const userScopes = scopeExtractionFn(req) || [];

      const hasScopes = scopeValidators[path][method](userScopes);
      if (hasScopes) {
        return next();
      }
      next(new AuthorizationError("Not authorized"));
    } catch (e) {
      next(e);
    }
  }

  return processRequest;
}

function extractPath(req) {
  const path = req.baseUrl.concat(req.route.path);
  return path.endsWith("/") && path.length > 1
    ? path.substring(0, path.length - 1)
    : path;
}

module.exports = initNew;
