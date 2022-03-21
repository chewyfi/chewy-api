const { getPrices } = require('../stats/getPrices');

async function prices(ctx) {
  try {
    const tokenPrices = await getPrices();
    ctx.status = 200;
    ctx.body = { ...tokenPrices };
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}


module.exports = {
  prices,
};
