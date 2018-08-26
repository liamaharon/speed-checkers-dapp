import BigNumber from 'bignumber.js';

export const weiToEther = wei => new BigNumber(wei).div(new BigNumber('10').pow('18'));

export const etherToWei = ether => new BigNumber(ether).times(new BigNumber('10').pow('18'));
