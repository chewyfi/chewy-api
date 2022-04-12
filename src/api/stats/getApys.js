const { getMoonriverApys } = require('./moonriver');

const INIT_DELAY = process.env.INIT_DELAY || 60 * 100;
const REFRESH_INTERVAL = 1000 * 60 * 10;

let apys = {};
let lastUpdated = Date.now();

const getApys = () => {
  if (Object.keys(apys).length === 0) {
    updateApys();
  } else if (Date.now() > lastUpdated + REFRESH_INTERVAL) {
    updateApys();
  }

  return apys;
};

const updateApys = async () => {
  console.log('> updating apys');

  try {
    console.log('before fetching results')
    const results = await Promise.allSettled([getMoonriverApys()]);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getApys error', result.reason);
        continue;
      }

      // Set default APY values
      let mappedApyValues = result.value;

      apys = { ...apys, ...mappedApyValues };
    }

    console.log('> updated apys');
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  lastUpdated = Date.now();
};

setTimeout(updateApys, INIT_DELAY);

module.exports = { getApys };
