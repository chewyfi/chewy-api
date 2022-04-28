const { getApys } = require('./getApys');

const TIMEOUT = 10 * 60 * 1000;

cached_apys = {
  'moonwell-usdc-leverage': 0.07496099695942712,
  'moonwell-movr-leverage': 0.3530856961352685,
  'moonwell-usdt-leverage': 0.17029377312590646,
  'moonwell-eth-leverage': 0.05308034898453193,
  'moonwell-frax-leverage': 0.11154158344971866,
  'moonwell-btc-supply': 0.06954675086184357,
  '3POOL': 0.0917,
  'KSM-stKSM': 0.4719,
  FRAX3POOL: 0.1406
}

async function apy(ctx) {
  try {
    // ctx.request.socket.setTimeout(TIMEOUT);
    let apys = await getApys();
    console.log("CACHED APY ", cached_apys)

    if (Object.keys(apys).length === 0) {
      // TODO: Can we get the previous response?
      ctx.body = 'There is no APYs data yet';
      ctx.body = {...cached_apys}
    } else {
      final = { 
        ...apys, 
        '3POOL': Math.random() > .9 ? (9.17 + to_replace()) / 100 : 9.17 / 100,
        'KSM-stKSM': Math.random() > .9 ? (47.19 + to_replace(0, 7)) / 100 : 47.19 / 100,
        FRAX3POOL: Math.random() > .9 ? (14.06 + to_replace()) / 100 : 14.06 / 100
      };
      ctx.body = final
      cached_apys = final
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
