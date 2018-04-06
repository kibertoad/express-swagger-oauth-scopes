# express-swagger-oauth-scopes
Express.js middleware to grant/block access to endpoints based on Swagger security entries

Note that it should be applied within router and not globally on application since it depends on route being already resolved for the request.


```js
const swaggerOauth = require('express-swagger-oauth-scopes').middleware;
const swaggerService = require('../services/swagger.service'); //implement logic for generating/loading Swagger specification somewhere
const authUtils = require('../utils/auth.utils'); //implement logic for getting user permissions from request somewhere
const swaggerDocument = swaggerService.getSwaggerSync() // valid Swagger document, parsed into a JS object;

function getNewSwaggerOauthInstance() {
	return swaggerOauth(swaggerDocument, authUtils.getPermissionsFromRequest);
}
 
router.post('/users',
	getNewSwaggerOauthInstance(),
	async (req, res, next) => {
		try {
		  // user creation logic
		} catch (e) {
			return next(e);
		}
	});
```


Recommended way to use this library is together with swagger-jsdoc (https://github.com/Surnet/swagger-jsdoc) and
swagger-combine (https://github.com/maxdome/swagger-combine) so that you could keep security definition together
with controller implementation:


```js
const swaggerOauth = require('express-swagger-oauth-scopes').middleware;
const swaggerService = require('../services/swagger.service'); //implement logic for generating/loading Swagger specification somewhere
const authUtils = require('../utils/auth.utils'); //implement logic for getting user permissions from request somewhere
const swaggerDocument = swaggerService.getSwaggerSync() // valid Swagger document, parsed into a JS object;

function getNewSwaggerOauthInstance() {
	return swaggerOauth(swaggerDocument, authUtils.getPermissionsFromRequest);
}

/**
 * @swagger
 * /users:
 *   post:
 *     description: Create user
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: user
 *         in: body
 *         required: true
 *         schema:
 *           $ref: 'User.yaml'
 *     security:
 *       - oauth:
 *         - 'CREATE_USERS'
 *     responses:
 *       201:
 *         description: User data
 *         schema:
 *           $ref: 'User.yaml'
 */
router.post('/users',
	getNewSwaggerOauthInstance(),
	async (req, res, next) => {
		try {
		  // user creation logic
		} catch (e) {
			return next(e);
		}
	});
```

Reference implementation of a swagger.service:

```js
const swaggerJSDoc = require('swagger-jsdoc');
const objectionSwagger = require('objection-swagger');
const swaggerCombine = require('swagger-combine');
const mkdirp = require('mkdirp-promise');
const config = require('config');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const PATH_TO_COMBINED_SWAGGER = config.swagger.pathToCombinedSwagger;
const PATH_TO_MODELS = config.models.path;

let builtSwaggerSchema;

const options = {
	swaggerDefinition: {
		info: {
			title: 'User Management System',
			version: '1.0.0'
		},
	},
	apis: [
		'./controllers/**/*.js',
		'./modules/**/controllers/**/*.js'
	], // Path to the controllers sources that will be parsed for Swagger fragments in JSDocs
};

const modelContainer = require('require-all')({
	dirname: PATH_TO_MODELS,
	filter: /(.+model)\.js$/,
	recursive: false
});

const models = _.values(modelContainer);

async function generateSwagger() {
	const swaggerDir = path.dirname(PATH_TO_COMBINED_SWAGGER);
	const pathToTmpSwagger = `${swaggerDir}/tmpSwagger.yaml`;

	//Generate YAML for controllers
	const swaggerFromControllers = swaggerJSDoc(options);
	const swaggerYaml = yaml.safeDump(swaggerFromControllers);
	await mkdirp(swaggerDir);
	fs.writeFileSync(pathToTmpSwagger, swaggerYaml);

	//Generate YAML for models - if you are using objection.js, you can use objection-swagger, there are probably equivalent libraries available for Sequelize as well
	await objectionSwagger.saveSchema(models, swaggerDir);

	//Combine YAMLs
	combinedSwaggerSchema = await swaggerCombine(pathToTmpSwagger);
	fs.writeFileSync(PATH_TO_COMBINED_SWAGGER, yaml.safeDump(combinedSwaggerSchema));
	return combinedSwaggerSchema;
}

/**
 * Returns generated swagger
 *
 * @returns {Promise<Object>} swagger object
 */
async function getSwagger() {
	if (builtSwaggerSchema) {
		return builtSwaggerSchema;
	}
	return generateSwagger();
}

/**
 * Returns generated swagger
 *
 * @returns {Object} swagger object
 */
function getSwaggerSync() {
	if (builtSwaggerSchema) {
		return builtSwaggerSchema;
	}
	throw new Error('Swagger document was not yet built, please ensure that you are calling this method after initialization phase is completed.');
}

module.exports = {
	generateSwagger,
	getSwagger,
	getSwaggerSync
};
```
