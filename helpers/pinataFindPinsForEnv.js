const { IS_PROD } = require('../constants');

// Find the current Pinata IPFS hashes that are Pinned and associated with the
// current environment (development or production) of a given Pinata instance
const findPinsForEnv = async (pinata) => {
  const metadataFilter = {
    keyvalues: {
      // Check the value of the key `env` matches our current environment
      env: {
        value: IS_PROD ? 'production' : 'development',
        op: 'eq'
      }
    }
  };
  const filters = {
    status: 'pinned',
    metadata: metadataFilter
  };
  const result = await pinata.pinList(filters);

  return result;
}

module.exports = {
  findPinsForEnv
}
