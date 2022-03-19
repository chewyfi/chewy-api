const { getPrice } = require('../api/stats/getPrices');

const CACHE_TIMEOUT = 10 * 60 * 1000;
const cache = {};

function isCached({ oracle, id }) {
  if (`${oracle}-${id}` in cache) {
    return cache[`${oracle}-${id}`].t + CACHE_TIMEOUT > Date.now();
  }
  return false;
}

function getCachedPrice({ oracle, id }) {
  return cache[`${oracle}-${id}`].price;
}

function addToCache({ oracle, id, price }) {
  cache[`${oracle}-${id}`] = { price: price, t: Date.now() };
}

const fetchPrice = async ({ oracle, id }) => {
  if (oracle === undefined) {
    console.trace('Undefined oracle');
    return 0;
  }
  if (id === undefined) {
    console.error('Undefined pair');
    return 0;
  }

  if (isCached({ oracle, id })) {
    return getCachedPrice({ oracle, id });
  }

  let price = 0;
  if (oracle === 'tokens') {
    price = await getPrice(id);
  } else {
    throw new Error(`Oracle '${oracle}' not implemented`);
  }

  addToCache({ oracle, id, price });
  return price;
};

module.exports = fetchPrice;
