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
const { uploadFileToSkynet } = require('../server/helpers/uploadFileToSkynet');
const { BUILD_SKYNET_SUBDIRECTORY, HANDSHAKE_DOMAIN_NAME, IS_PROD } = require('../constants');

const PATH_SOURCE_CODE = path.join(__dirname, '..', 'client', 'build');
const WOPTS = { encoding: 'utf8', flag: 'w' };
const PATH_SKYNET = path.join(__dirname, '..', 'client', 'build', BUILD_SKYNET_SUBDIRECTORY);

function writeFiles(name, content) {
  [PATH_SOURCE_CODE].forEach((root) => {
    const filePath = `${root}/${BUILD_SKYNET_SUBDIRECTORY}/${name}`;
    fs.writeFileSync(filePath, content, WOPTS,
      function() { console.log(`Wrote ${filePath}`) })
  });
}

/**
 * Skynet hash (Skylink) redirection to Handshake domain name
 */
async function uploadFile() {
  execute(`mkdir -p ${PATH_SKYNET}`);
  const url = `${HANDSHAKE_DOMAIN_NAME}`;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting to Handshake domain name</title>
    <meta http-equiv="refresh" content="0; url=${url}" />
    <style>
      body { font-family: sans-serif; line-height: 1.5rem; padding: 2rem; text-align: center }
      p { margin: 0 }
    </style>
  </head>
  <body>
    <p>Redirecting to <a href="${url}">${url}</a></p>
  </body>
</html>`;
  console.log('Writing files for redirecting to Handshake domain from Skynet hash (Skylink)');
  writeFiles('index.html', html);
  return uploadFileToSkynet();
}

/**
 * Upload the EthQuad source code Skynet hash using Skynet SDK.
 */
async function main() {
  const siaSkylink = await uploadFile();
}

main()
  .catch(console.error)
  .finally(() => process.exit());

