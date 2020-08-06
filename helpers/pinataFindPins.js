const { IS_PROD } = require('../constants');

// Find the current Pinata IPFS hashes that are Pinned and associated with the
// current environment (development or production) of a given Pinata instance
const findPinsForEnv = async (pinata) => {
  console.log('findPinsForEnv');
  const metadataFilter = {
    keyvalues: {
      // Check the value of the key `env` matches our current environment
      env: {
        value: IS_PROD ? 'production' : 'development',
        op: 'eq'
      },
      // Check the value of the key `tradition` since we do not want those that are true
      // as they are meant for a different task.
      traditional: {
        value: 'true',
        op: 'ne' // Not Equal
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

// Find the current Pinata IPFS hashes (for redirecting to traditional domain)
// that are Pinned for a given Pinata instance
const findPinsForRedirectToTraditional = async (pinata) => {
  const metadataFilter = {
    keyvalues: {
      // Check the value of the key `tradition` since we want those set to true
      traditional: {
        value: 'true',
        op: 'eq' // Equal
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
  findPinsForEnv,
  findPinsForRedirectToTraditional
}
