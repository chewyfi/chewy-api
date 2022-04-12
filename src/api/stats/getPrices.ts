`use strict`;
import { fetchCoinGeckoPrices } from '../../utils/fetchCoinGeckoPrices';

// const INIT_DELAY = 0 * 60 * 1000;

const INIT_DELAY = 0;

const REFRESH_INTERVAL = 0;


// const REFRESH_INTERVAL = 5 * 60 * 1000;

const coinGeckoCoins = ['bitcoin', 'moonriver', 'ethereum', 'moonwell'];

const knownPrices = {
  USDT: 1,
  USDC: 1,
  FRAX: 1,
  '3pool': 1,
  'FRAX-3pool': 1,
  'KSM-pool': 1
};

let tokenPricesCache;

const updatePrices = async () => {
  console.log('> updating token prices');
  try {
    const coinGeckoPrices = fetchCoinGeckoPrices(coinGeckoCoins);

    const tokenPrices = { ...(await coinGeckoPrices), ...knownPrices };

    await tokenPrices;

    tokenPricesCache = tokenPrices;

    return {
      tokenPrices,
    };
  } catch (err) {
    console.error(err);
  } finally {
    console.log('> updated token prices');
  }
};

export const getPrices = async () => {
  return await tokenPricesCache;
};

export const getPrice = async tokenSymbol => {
  const tokenPrices = await getPrices();
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    const price = tokenPrices[tokenSymbol];
    return price;
  }
  console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
};

const init =
  // Flexible delayed initialization used to work around ratelimits
  new Promise((resolve, reject) => {
    setTimeout(resolve, INIT_DELAY);
  }).then(updatePrices);

tokenPricesCache = init.then(({ tokenPrices }) => tokenPrices);
