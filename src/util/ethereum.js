import BigNumber from 'bignumber.js';

export const parseEthBalance = bal => new BigNumber(bal).div(new BigNumber('10').pow('18'));
