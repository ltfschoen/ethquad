const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET;
const INFURA_ENDPOINT_ETH2 = process.env.INFURA_ENDPOINT_ETH2;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const IS_PROD = process.env.NODE_ENV === 'production';
const BUILD_IPFS_SUBDIRECTORY = IS_PROD ? 'ipfs/production' : 'ipfs/development';
const TRADITIONAL_DOMAIN = 'https://ethquad.herokuapp.com';

module.exports = {
  BUILD_IPFS_SUBDIRECTORY,
  INFURA_PROJECT_ID,
  INFURA_PROJECT_SECRET,
  INFURA_ENDPOINT_ETH2,
  IPFS_GATEWAY,
  IS_PROD,
  TRADITIONAL_DOMAIN
};
