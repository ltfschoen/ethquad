const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET;
const INFURA_ENDPOINT_ETH2 = process.env.INFURA_ENDPOINT_ETH2;
const IS_PROD = process.env.NODE_ENV === 'production';
const BUILD_IPFS_SUBDIRECTORY = IS_PROD ? 'ipfs/production' : 'ipfs/development';

module.exports = {
  BUILD_IPFS_SUBDIRECTORY,
  INFURA_PROJECT_ID,
  INFURA_PROJECT_SECRET,
  INFURA_ENDPOINT_ETH2,
  IS_PROD
};
