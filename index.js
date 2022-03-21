'use strict';

const Koa = require('koa');
const helmet = require('koa-helmet');
const body = require('koa-bodyparser');
const cors = require('@koa/cors');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');

const rt = require('./src/middleware/rt');
const powered = require('./src/middleware/powered');
const router = require('./src/router');

const app = new Koa();

app.use(rt);
app.use(conditional());
app.use(etag());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(powered);
app.use(body());

app.context.cache = {};

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`> beefy-api running! (:${port})`);