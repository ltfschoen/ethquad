// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
//
// Modifications by Luke Schoen
// Original source: https://github.com/polkadot-js/apps/blob/master/scripts/ipfsUpload.js

require('dotenv').config()
const fs = require('fs');
const path = require('path');
const pinataSDK = require('@pinata/sdk');
const { execSync } = require('child_process');

/**
 * Duplicate of https://github.com/polkadot-js/dev/blob/master/packages/dev/scripts/execSync.js
 */
function execute(cmd, noLog) {
  !noLog && console.log(`$ ${cmd}`);

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    process.exit(-1);
  }
};

const GATEWAY = 'https://ipfs.io/ipfs/';
const PATH_SOURCE_CODE = path.join(__dirname, '..', 'client', 'build');
const WOPTS = { encoding: 'utf8', flag: 'w' };
const REPO = `git@github.com:ltfschoen/ethquad.git`;
const BUILD_IPFS_SUBDIRECTORY = 'ipfs';
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
  execute(`git push ${REPO} HEAD:${process.env.GITHUB_REF}`, true);
}

/**
 * Build front-end into client/build directory using Webpack
 * Users to visit https://ethquad.crypto shall be directed to the build front-end hosted on IPFS.
 * Alternatively users that visit https://ethquad.herokuapp.com use the centralised front-end hosted on Heroku,
 * which also serves as the EthQuad server-side API.
 */
async function pin() {
  execute(`mkdir -p ${PATH_IPFS}`);
  const options = {
    pinataMetadata: {
      name: 'EthQuad',
    },
    pinataOptions: {
      wrapWithDirectory: true
    }
  };
  console.log('Generating Pin...');
  const result = await pinata.pinFromFS(PATH_SOURCE_CODE, options);
  console.log('Generated Pin with IPFS hash: ', result);
  const url = `${GATEWAY}${result.IpfsHash}/build/`;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting to IPFS gateway</title>
    <meta http-equiv="refresh" content="0; url=${url}" />
    <style>
      body { font-family: sans-serif; line-height: 1.5rem; padding: 2rem; text-align: center }
      p { margin: 0 }
    </style>
  </head>
  <body>
    <p>Redirecting to: </p>
    <p><a href="${url}">${url}</a></p>
  </body>
</html>`;

  console.log('Writing files for redirecting to IPFS hash of website');
  writeFiles('index.html', html);
  writeFiles('pin.json', JSON.stringify(result));
  if (process.env.NODE_ENV !== 'production') {
    // updateGithub(result.IpfsHash);
  }
  console.log(`Pinned IPFS hash: ${result.IpfsHash}`);

  return result.IpfsHash;
}

async function unpin(exclude) {
  const result = await pinata.pinList({ status: 'pinned' });

  if (result.count > 1) {
    const filtered = result.rows
      .map(({ ipfs_pin_hash: hash }) => hash)
      .filter((hash) => hash !== exclude);

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
  pinata = await pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
  const result = await pinata.testAuthentication();
  if (result.authenticated) {
    console.log('Successfully authenticated with Pinata');
    const hash = await pin();
    await unpin(hash);
  } else {
    console.error('Unable to authenticate with Pinata');
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());