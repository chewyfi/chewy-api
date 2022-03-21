const { getApys } = require('./getApys');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    if (Object.keys(apys).length === 0) {
      ctx.body = 'There is no APYs data yet';
    } else {
      ctx.body = apys;
    }

    ctx.status = 200;
  } catch (err) {
    ctx.throw(500, err);
  }
}

module.exports = { apy };
