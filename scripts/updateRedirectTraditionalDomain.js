require('dotenv').config()
const fs = require('fs');
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

  // https://docs.unstoppabledomains.com/#tag/direct_blockchain
  // Registry Address on Ethereum Mainnet for .crypto domain names
  const registryContractAddress = '0xd1e5b0ff1287aa9f9a268759062e4ab08b9dacbe';
  // https://etherscan.io/address/0xd1e5b0ff1287aa9f9a268759062e4ab08b9dacbe#code
  const registryContractAddressABI = JSON.parse(fs.readFileSync('./assets/data/registryContractDomainCrypto.json').toString());
  RegistryContractInstance = await new web3.eth.Contract(registryContractAddressABI, registryContractAddress);
  RegistryContractInstance.setProvider(web3Provider);

  const resolution = new Resolution({blockchain: {
    web3Provider: web3Provider,
    ens: {url: infuraHttpProviderUrl},
    cns: {url: infuraHttpProviderUrl}
  }});
  // console.log('resolution:', resolution);

  const domainInfo = {
    address: 'ethquad.crypto',
    currency: 'ETH'
  };
  // Resolver Contract Address on Ethereum Mainnet for custom .crypto domain name
  let resolverContractAddress;
  // Interacting with .crypto by first hashing domain using EIP-137 namehash to obtain tokenId.
  const tokenId = resolution.namehash(domainInfo.address);
  console.log('tokenId', tokenId);
  resolverContractAddress = await RegistryContractInstance.methods.resolverOf(tokenId).call();
  console.log('resolverContractAddress: ', resolverContractAddress);

  const ethAddress = await resolveDomain(resolution, domainInfo.address, domainInfo.currency);
  console.log('ethAddress:', ethAddress);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
