require('dotenv').config()
const debug = require('debug')('app');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('EthQuad API');
console.log('NODE_ENV', process.env.NODE_ENV);
console.log('IPFS', process.env.IPFS);

/**
 * Example: http://localhost:3000/api/endpoint?query=<PARAMETER>
 */
app.get('/api/endpoint', (req, res, next) => {
  res.send({
    message: 'Hello'
  })
});

/**
 * Handle React routing, return all requests to React app.
 * When the IPFS environment variable is set, host the HTML file that
 * redirects to the IPFS hash containing the front-end website instead of
 * loading it from Heroku at ../client/build/index.html.
 * Do not serve static files when redirecting to IPFS hash.
 */
const BUILD_IPFS_SUBDIRECTORY = 'ipfs';
const isIpfs = process.env.IPFS === 'true';
if (!isIpfs) {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

const subdir = isIpfs ? `../client/build/${BUILD_IPFS_SUBDIRECTORY}` : '../client/build';

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, subdir, 'index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
