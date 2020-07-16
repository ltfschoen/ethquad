require('dotenv').config()
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { default: Resolution } = require('@unstoppabledomains/resolution');

const resolveDomain = async (resolution, domain, currency) => {
  try {
    const address = await resolution.address(domain, currency);
    if (address) {
      console.log(domain, ' resolves to', address);
    }
    return address;
  } catch (error) {
    console.error('Unable to resolve address: ', error);
  }
}

// https://docs.unstoppabledomains.com/#section/Getting-Started
const main = async () => {
  const infuraHttpProviderUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
  console.log('Custom script to interact with Unstoppable Domains API');
  const web3Provider = new HDWalletProvider(process.env.MNENOMIC, infuraHttpProviderUrl);
  const web3 = new Web3(web3Provider);
  const coinbase = await web3.eth.getCoinbase();
  const resolution = new Resolution({blockchain: {
    web3Provider: web3Provider,
    ens: {url: infuraHttpProviderUrl},
    cns: {url: infuraHttpProviderUrl}
  }});
  console.log('resolution:', resolution);
  const domainInfo = {
    address: 'ethquad.crypto',
    currency: 'ETH'
  }

  const ethAddress = await resolveDomain(resolution, domainInfo.address, domainInfo.currency);
  console.log('ethAddress:', ethAddress);

}

main()
  .catch(console.error)
  .finally(() => process.exit());
