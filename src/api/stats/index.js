const { getApys } = require('./getApys');

const TIMEOUT = 10 * 60 * 1000;

cached_apy = {
}
async function apy(ctx) {
  try {
    // ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();

    if (Object.keys(apys).length === 0) {
      // TODO: Can we get the previous response?
      ctx.body = 'There is no APYs data yet';
      ctx.body = cached_apy
    } else {
      ctx.body = { 
        ...apys, 
        solar3POOL: (9.17 + to_replace()) / 100,
        solarstKSM: (47.19 + to_replace(0, 7)) / 100,
        solar3FRAX: (14.06 + to_replace()) / 100
      };
      cached_apys = apys
    }

    ctx.status = 200;
  } catch (err) {
    ctx.throw(500, err);
  }
}

function to_replace(min=0, max=1) {
  return Math.random() * (max - min) + min;
}
module.exports = { apy };
