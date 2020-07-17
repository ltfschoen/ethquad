require('dotenv').config()
const debug = require('debug')('app');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { BUILD_IPFS_SUBDIRECTORY, IS_PROD } = require('../constants');
const { findPinsForEnv } = require('../helpers/pinataFindPinsForEnv');
const beaconMiddleware = require('./middleware/beaconMiddleware.js');
const { connectToPinata } = require('./helpers/connectToPinata');
const app = express();
const port = process.env.PORT || 5000;

const corsWhitelist = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://ipfs.io'
];
// https://www.npmjs.com/package/cors#configuration-options
const corsOptions = {
  'allowedHeaders': ['Content-Type','Authorization','Origin','Accept'],
  'exposedHeaders': ['Content-Type','Authorization','Origin','Accept'],
  'origin': function (origin, callback) {
    // Do not want to block REST tools or server-to-server requests
    // when running with `yarn dev` on localhost:3000
    if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  // "origin": "*",
  'methods': 'GET,POST,HEAD,OPTIONS'
};

// Enables CORS to allow queries from Website IPFS Hash to its Express API
// app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('EthQuad API');
console.log('NODE_ENV', process.env.NODE_ENV);
console.log('IPFS', process.env.IPFS);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({status: err.status, message: err.message})
});

/**
 * Example: http://localhost:3000/api/endpoint?query=<PARAMETER>
 * http://localhost:5000/api/getWebsiteIPFSHash
 */
app.get('/api/getWebsiteIPFSHash', cors(corsOptions),
  // Middleware chain
  async (req, res, next) => {
    console.log('Received GET request at API endpoint /api/getWebsiteIPFSHash');
    console.log('Connecting to Pinata');
    pinata = await connectToPinata();
    if (pinata) {
      console.log('Retrieving Pin List');
      const pinList = await findPinsForEnv(pinata);
      let filtered;
      let websiteIPFSHash;
      if (pinList.count > 0) {
        filtered = pinList.rows
          .filter((row) => !row.date_unpinned);
        console.log('Found pinned IPFS hashes for current environment: ', filtered);
        if (filtered.length == 1) {
          websiteIPFSHash = filtered[0].ipfs_pin_hash;
          console.log('Retrieved Pin Hash: ', websiteIPFSHash);
          res.send({
            websiteIPFSHash 
          });
        } else {
          console.error('Unable to find pinned IPFS hash for current environment');
        }
      }
    } else {
      throw {status: 500, message: 'Unable to obtain Pinata Pin List'};
    }
  }
);

app.options('*', cors())
app.get('/api/beacon/chainhead', cors(corsOptions),
  // Middleware chain
  async (req, res, next) => {
    console.log('Getting Beacon Chain Head');
    await beaconMiddleware.getChainHead(req, res, next);
  },
  async (req, res, next) => {
    // Handle error in async function
    try {
      const chainHead = res.locals.chainHead;
      res.send({
        chainHead,
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }
);

/**
 * Handle React routing, return all requests to React app.
 * When the IPFS environment variable is set, host the HTML file that
 * redirects to the IPFS hash containing the front-end website instead of
 * loading it from Heroku at ../client/build/index.html.
 * Do not serve static files when redirecting to IPFS hash.
 */
const isIpfs = process.env.IPFS === 'true';
if (!isIpfs) {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

const subdir = isIpfs ? `../client/build/${BUILD_IPFS_SUBDIRECTORY}` : '../client/build';

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, subdir, 'index.html'));
});

app.listen(port, () => console.log(`CORS-enabled web server listening on port ${port}`));
