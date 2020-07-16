const pinataSDK = require('@pinata/sdk');

let pinata;
const connectToPinata = async () => {
  pinata = await pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
  const result = await pinata.testAuthentication();
  if (result.authenticated) {
    console.log('Successfully authenticated with Pinata');
    return pinata;
  } else {
    console.error('Unable to authenticate with Pinata')
  }
}

module.exports = {
  connectToPinata
}
