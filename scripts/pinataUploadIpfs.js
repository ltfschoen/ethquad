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
const { BUILD_IPFS_SUBDIRECTORY, IPFS_GATEWAY, IS_PROD } = require('../constants');
const { findPinsForEnv } = require('../helpers/pinataFindPins');

const PATH_SOURCE_CODE = path.join(__dirname, '..', 'client', 'build');
const WOPTS = { encoding: 'utf8', flag: 'w' };
const REPO = `git@github.com:ltfschoen/ethquad.git`;

const PATH_IPFS = path.join(__dirname, '..', 'client', 'build', BUILD_IPFS_SUBDIRECTORY);
let pinata;

function writeFiles(name, content) {
  [PATH_SOURCE_CODE].forEach((root) => {
    const filePath = `${root}/${BUILD_IPFS_SUBDIRECTORY}/${name}`;
    fs.writeFileSync(filePath, content, WOPTS,
      function() { console.log(`Wrote ${filePath}`) })
  });
}

function updateGithub(hash) {
  execute('git add --all .');
  execute(`git commit --no-status --quiet -m "[CI Skip] publish/ipfs ${hash} skip-checks: true"`);
  execute(`git push origin ${REPO}`);
}

/**
 * Build front-end into client/build directory using Webpack
 * Users that visit https://ethquad.crypto shall be directed to page that is hosted on IPFS that redirects them
 * to the traditional domain https://ethquad.herokuapp.com (see pinataUploadIpfsTraditional.js),
 * which in turn redirects them to the front-end that is hosted at another IPFS hash.
 * Visiting https://ethquad.herokuapp.com directly is only for using the centralised EthQuad server-side API
 * hosted on Heroku.
 */
async function pin() {
  execute(`mkdir -p ${PATH_IPFS}`);
  const options = {
    pinataMetadata: {
      // Store frontend at different IPFS location in development and production
      name: IS_PROD ? 'EthQuad-prod' : 'EthQuad-dev',
      keyvalues: {
        env: IS_PROD ? 'production' : 'development',
        traditional: 'false'
      }
    },
    pinataOptions: {
      wrapWithDirectory: true
    }
  };
  console.log('Generating Pin...');
  const result = await pinata.pinFromFS(PATH_SOURCE_CODE, options);
  console.log('Generated Pin with IPFS hash: ', result);
  const url = `${IPFS_GATEWAY}${result.IpfsHash}/build/`;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting to Official IPFS Gateway</title>
    <meta http-equiv="refresh" content="0; url=${url}" />
    <style>
      body { font-family: sans-serif; line-height: 1.5rem; padding: 2rem; text-align: center }
      p { margin: 0 }
    </style>
  </head>
  <body>
    <p>Redirecting to ${IS_PROD ? 'production' : 'development'}: </p>
    <p><a href="${url}">${url}</a></p>
  </body>
</html>`;

  console.log('Writing files for redirecting to IPFS hash of website');
  writeFiles('index.html', html);
  writeFiles('pin.json', JSON.stringify(result));
  if (!IS_PROD) {
    // updateGithub(result.IpfsHash);
  }
  console.log(`Pinned IPFS hash: ${result.IpfsHash}`);

  return result.IpfsHash;
}

// Unpin previous Website IPFS Hashes of the current environment
// that we are no longer using
// Reference: https://github.com/PinataCloud/Pinata-SDK#pinlist
async function unpin(exclude) {
  console.log(`Unpinning previous website IPFS hashes of ${IS_PROD ? 'production' : 'development'} environment`);
  const pinList = await findPinsForEnv(pinata);
  console.log('Found list of IPFS hashes for current environment: ', pinList);
  if (pinList.count > 1) {
    const filtered = pinList.rows
      .map(({ ipfs_pin_hash: hash }) => hash)
      .filter((hash) => hash !== exclude);
    console.log('Found old IPFS hashes for current environment to Unpin: ', filtered);

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
 * Pin and Unpin the EthQuad source code IPFS hash in Pinata using Pinata SDK.
 * Reference: https://github.com/PinataCloud/Pinata-SDK
 */
async function main() {
  pinata = await connectToPinata();
  if (pinata) {
    const hash = await pin();
    await unpin(hash);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
