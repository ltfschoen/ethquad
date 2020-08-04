// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
//
// Modifications by Luke Schoen
// Original source: https://github.com/polkadot-js/apps/blob/master/scripts/ipfsUpload.js

require('dotenv').config()
const fs = require('fs');
const path = require('path');
const { execute } = require('../helpers/execute');
const { connectToPinata } = require('../server/helpers/connectToPinata');
const { BUILD_IPFS_SUBDIRECTORY, IPFS_GATEWAY } = require('../constants');
const { findPinsForRedirectToTraditional } = require('../helpers/pinataFindPins');

const PATH_SOURCE_CODE = path.join(__dirname, '..', 'client', 'build');
const WOPTS = { encoding: 'utf8', flag: 'w' };

const PATH_IPFS = path.join(__dirname, '..', 'client', 'build', BUILD_IPFS_SUBDIRECTORY);
let pinata;

function writeFiles(name, content) {
  [PATH_SOURCE_CODE].forEach((root) => {
    const filePath = `${root}/${BUILD_IPFS_SUBDIRECTORY}/${name}`;
    fs.writeFileSync(filePath, content, WOPTS,
      function() { console.log(`Wrote ${filePath}`) })
  });
}

/**
 * Users that visit https://ethquad.crypto shall be directed to page that is hosted on IPFS that redirects them
 * to the traditional domain https://ethquad.herokuapp.com.
 * See https://community.unstoppabledomains.com/t/add-an-ipfs-hash-to-your-domain/614
 */
async function pinTraditional() {
  execute(`mkdir -p ${PATH_IPFS}`);
  const options = {
    pinataMetadata: {
      name: 'EthQuad-prod-traditional',
      keyvalues: {
        env: 'production',
        traditional: 'true'
      }
    },
    pinataOptions: {
      wrapWithDirectory: false
    }
  };
  console.log('Generating Pin (for redirecting to traditional domain)...');
  const fileReadStream = await fs.createReadStream(path.join(__dirname, 'redirect-traditional.html'));
  console.log('Read File');
  const result = await pinata.pinFileToIPFS(fileReadStream, options);
  console.log('Generated Pin with IPFS hash: ', result);
  const url = `${IPFS_GATEWAY}${result.IpfsHash}`;
  console.log('Writing file with pin (for redirect to traditional domain from an IPFS hash)');
  writeFiles('pinTraditional.json', JSON.stringify(result));
  console.log(`Pinned IPFS Hash (for redirect to traditional domain): ${url}`);
  console.log('Please change the IPFS Hash value at https://unstoppabledomains.com/manage to this new IPFS Hash');

  return result.IpfsHash;
}

// Unpin previous IPFS Hash (for redirecting to traditional domain) that we are no longer using
// Reference: https://github.com/PinataCloud/Pinata-SDK#pinlist
async function unpinTraditional(exclude) {
  console.log(`Unpinning previous IPFS hashes (for redirecting to traditional domain)`);
  const pinList = await findPinsForRedirectToTraditional(pinata);
  console.log('Found list of IPFS hashes (for redirecting to traditional domain)', pinList);
  if (pinList.count > 1) {
    const filtered = pinList.rows
      .map(({ ipfs_pin_hash: hash }) => hash)
      .filter((hash) => hash !== exclude);
    console.log('Found old IPFS hashes (for redirecting to traditional domain) to Unpin: ', filtered);

    if (filtered.length) {
      await Promise.all(
        filtered.map((hash) =>
          pinata
            .unpin(hash)
            .then(() => console.log(`Unpinned IPFS hash: ${hash}`))
            .catch(console.error)
        )
      );
    }
  }
}

/**
 * Pin and Unpin the EthQuad IPFS hash (for redirecting to traditional domain) in Pinata using Pinata SDK.
 * Reference: https://github.com/PinataCloud/Pinata-SDK
 */
async function main() {
  pinata = await connectToPinata();
  if (pinata) {
    const hash = await pinTraditional();
    await unpinTraditional(hash);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
