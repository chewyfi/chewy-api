const { getApys } = require('./getApys');

const TIMEOUT = 10 * 60 * 1000;

cached_apy = {

}
async function apy(ctx) {
  try {
    // ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    if (Object.keys(apys).length === 0) {
      // TODO: Can we get the previous response
      ctx.body = 'There is no APYs data yet';
      ctx.body = cached_apy
    } else {
      ctx.body = apys;
      cached_apys = apys
    }

    ctx.status = 200;
  } catch (err) {
    ctx.throw(500, err);
  }
}

module.exports = { apy };
