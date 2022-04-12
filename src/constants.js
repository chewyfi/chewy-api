import { ChainId } from '../packages/address-book/address-book';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const BASE_HPY = 2190;
const MINUTELY_HPY = 525600;
const HOURLY_HPY = 8760;
const DAILY_HPY = 365;
const WEEKLY_HPY = 52;

const MOONRIVER_RPC = 'https://moonriver.blastapi.io/734c0c7f-091c-495e-898a-822e98c3181b';

const MOONRIVER_CHAIN_ID = ChainId.moonriver;

const MULTICHAIN_RPC = {
  [ChainId.moonriver]: MOONRIVER_RPC,
};

const MOONRIVER_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/moonriver_pools.js';

const MULTICHAIN_ENDPOINTS = {
  moonriver: MOONRIVER_VAULTS_ENDPOINT,
};

const BEEFY_PERFORMANCE_FEE = 0.045;
const SHARE_AFTER_PERFORMANCE_FEE = 1 - BEEFY_PERFORMANCE_FEE;

const EXCLUDED_IDS_FROM_TVL = ['venus-wbnb'];

export { MOONRIVER_RPC, MOONRIVER_CHAIN_ID, MOONRIVER_VAULTS_ENDPOINT };
