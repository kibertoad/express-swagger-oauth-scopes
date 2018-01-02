const express = require('express');
const router = express.Router();
const yaml = require('js-yaml');
const fs = require('fs');

const swaggerFile = fs.readFileSync('test/swagger/swagger.yaml');
const swaggerDocument = yaml.safeLoad(swaggerFile);
const oauthScopes = require('../../lib/oauth-scopes.middleware');
const extractor = require('../extractors/simple.scopes.extractor');

router.get('/', oauthScopes(swaggerDocument, extractor), async (req, res, next) => {
	try {
		res.send('ok');
	} catch (e) {
		logger.error('Error while processing request: ', e);
		next(e);
	}
});

module.exports = router;
