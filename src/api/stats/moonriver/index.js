// const { getSolarbeamDualLpV2Apys } = require('./getSolarbeamDualLpV2Apys');
const { getMoonwellApys } = require('./getMoonwellApys');

const getApys = [getMoonwellApys];

const getMoonriverApys = async () => {
  let apys = {};
  let promises = [];
  getApys.forEach(getApy => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getMoonriverApys error for' , result, result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues = result.value;

    apys = { ...apys, ...mappedApyValues };
  }

  return apys;
};

module.exports = { getMoonriverApys };
