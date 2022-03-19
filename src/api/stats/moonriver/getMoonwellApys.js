const BigNumber = require('bignumber.js');
const { moonriverWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const Comptroller = require('../../../abis/moonriver/Comptroller.json');
const IToken = require('../../../abis/moonriver/MToken.json');
const pools = require('../../../data/moonriver/moonwellPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
const { BASE_HPY, MOONRIVER_CHAIN_ID: chainId } = require('../../../constants');

const COMPTROLLER = '0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E';
const MFAM_PRICE = 0.017097;
// Rewards: MFAM => 0, MOVR => 1
const getMoonwellApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const secondsPerBlock = await Promise.all([getBlockTime(chainId)]);
  const BLOCKS_PER_YEAR = 31536000;
  const [{ supplyBase, supplyVxs }, { borrowBase, borrowVxs }] = await Promise.all([
    getSupplyApys(pool, BLOCKS_PER_YEAR),
    getBorrowApys(pool, BLOCKS_PER_YEAR),
  ]);

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyVxs, leveragedBorrowVxs } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyVxs,
      borrowVxs,
      pool.borrowDepth,
      pool.borrowPercent
    );

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 1, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async (pool, BLOCKS_PER_YEAR) => {
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);
  const supplySpeed = await comptrollerContract.methods.supplyRewardSpeeds(0, pool.itoken).call();

  let mfamPrice = await fetchPrice({ oracle: 'tokens', id: 'moonwell' });
  let movrPrice = await fetchPrice({ oracle: 'tokens', id: 'moonriver' });
  let tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });

  let [supplyRate, compRate0, compRate1, totalSupply, exchangeRateStored] = await Promise.all([
    itokenContract.methods.supplyRatePerTimestamp().call(),
    comptrollerContract.methods.supplyRewardSpeeds(0, pool.itoken).call(),
    comptrollerContract.methods.supplyRewardSpeeds(1, pool.itoken).call(),
    itokenContract.methods.totalSupply().call(),
    itokenContract.methods.exchangeRateStored().call(),
  ]);

  supplyRate = new BigNumber(supplyRate);
  compRate0 = new BigNumber(compRate0);
  compRate1 = new BigNumber(compRate1);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const comp0PerYear = compRate0.times(BLOCKS_PER_YEAR);
  const comp0PerYearInUsd = comp0PerYear.div('1e18').times(MFAM_PRICE);
  const comp1PerYear = compRate1.times(BLOCKS_PER_YEAR);
  const comp1PerYearInUsd = comp1PerYear.div('1e18').times(movrPrice);

  const compPerYearInUsd = comp0PerYearInUsd.plus(comp1PerYearInUsd);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: compPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (pool, BLOCKS_PER_YEAR) => {
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);

  let mfamPrice = await fetchPrice({ oracle: 'tokens', id: 'moonwell' });
  let movrPrice = await fetchPrice({ oracle: 'tokens', id: 'moonriver' });
  let tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });

  let [borrowRate, compRate0, compRate1, totalBorrows] = await Promise.all([
    itokenContract.methods.borrowRatePerTimestamp().call(),
    comptrollerContract.methods.borrowRewardSpeeds(0, pool.itoken).call(),
    comptrollerContract.methods.supplyRewardSpeeds(1, pool.itoken).call(),
    itokenContract.methods.totalBorrows().call(),
  ]);

  borrowRate = new BigNumber(borrowRate);
  compRate0 = new BigNumber(compRate0);
  compRate1 = new BigNumber(compRate1);
  totalBorrows = new BigNumber(totalBorrows);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');
  const comp0PerYear = compRate0.times(BLOCKS_PER_YEAR);
  const comp0PerYearInUsd = comp0PerYear.div('1e18').times(MFAM_PRICE);
  const comp1PerYear = compRate1.times(BLOCKS_PER_YEAR);
  const comp1PerYearInUsd = comp1PerYear.div('1e18').times(movrPrice);

  const compPerYearInUsd = comp0PerYearInUsd.plus(comp1PerYearInUsd);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(tokenPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowVxs: compPerYearInUsd.div(totalBorrowsInUsd),
  };
};

const getLeveragedApys = (supplyBase, borrowBase, supplyVxs, borrowVxs, depth, borrowPercent) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyVxs = new BigNumber(0);
  let leveragedBorrowVxs = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyVxs = leveragedSupplyVxs.plus(supplyVxs.times(borrowPercent.exponentiatedBy(i)));

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowVxs = leveragedBorrowVxs.plus(
      borrowVxs.times(borrowPercent.exponentiatedBy(i + 1))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  };
};

module.exports = { getMoonwellApys };
