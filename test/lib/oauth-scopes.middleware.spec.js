const express = require('express');

const request = require('supertest');
const assert = require('chai').assert;


const appHelper = require('../helpers/test.app.helper');
require('../helpers/test.bootstrap');

describe('GET /', () => {
	it('accepts if scopes are exact match', async () => {
		const app = express();
		app.use('/', require('../controllers/test.controller'));

		await appHelper.launchApp(app);
		return request(app)
			.get('/')
			.query({
				scopes: ['read:root']
			})
			.expect(200)
	});

	it('accepts if have excessive scopes', async () => {
		const app = express();
		app.use('/', require('../controllers/test.controller'));

		await appHelper.launchApp(app);
		return request(app)
			.get('/')
			.query({
				scopes: ['dummy', 'read:root', 'dummier']
			})
			.expect(200)
	});


	it('rejects if no scopes', async () => {
		const app = express();
		app.use('/', require('../controllers/test.controller'));

		await appHelper.launchApp(app);
		return request(app)
			.get('/')
			.expect(500)
	});

	it('rejects if wrong scopes', async () => {
		const app = express();
		app.use('/', require('../controllers/test.controller'));

		await appHelper.launchApp(app);
		return request(app)
			.get('/')
			.query({
				scopes: ['write:root']
			})
			.expect(500)
	});
});
