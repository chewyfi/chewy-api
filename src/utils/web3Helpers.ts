import Web3 from 'web3';
import { addressBookByChainId, ChainId } from '../../packages/address-book/address-book';
import { BeefyFinance } from '../../packages/address-book/types/beefyfinance';

import { MOONRIVER_RPC, MOONRIVER_CHAIN_ID } from '../constants';

const MULTICALLS: Record<ChainId, Pick<BeefyFinance, 'multicall'>['multicall']> = {
  [ChainId.moonriver]: addressBookByChainId[ChainId.moonriver].platforms.beefyfinance.multicall,
};

const clients: Record<keyof typeof ChainId, Web3[]> = {
  moonriver: [],
};
clients.moonriver.push(new Web3(MOONRIVER_RPC));

export const chainRandomClients = {
  moonriverRandomClient: () => clients.moonriver[~~(clients.moonriver.length * Math.random())],
};

export const _web3Factory = (chainId: ChainId) => {
  switch (chainId) {
    case MOONRIVER_CHAIN_ID:
      return chainRandomClients.moonriverRandomClient();
  }
};

export const _multicallAddress = (chainId: ChainId) => MULTICALLS[chainId];
