# About

HackFS team https://hack.ethglobal.co/hackfs/teams/recpspjxSRMexZJVg/recHa78c3edbmDkFu

## Roadmap

* [X] Frontend React.js & TypeScript boilerplate (./client)
* [X] Backend Express.js API boilerplate (./server). Served at https://ethquad.herokuapp.com/api
  * [X] Configure CORS to allow requests from Official IPFS Gateway
* [X] Local Docker container setup process for running with Textile.io storage API (PowerGate) that interacts with Lotus (Filecoin) and IPFS
* [ ] Production Docker container running with Textile.io storage API (PowerGate) that interacts with Lotus (Filecoin) and IPFS
* [X] Frontend Slate Design System UI components that interact with PowerGate (./client/src/)
  * [X] Connect and obtain Authorisation to access the Filecoin File System (FFS) API using Textile PowerGate JS Client (@textile/powergate-client)
  * [X] Generate a Powergate token. Store or retrieve (if exists) from web browser Local Storage. Check if retrieved existing Powergate token invalid due to restarting local Docker container with Textile PowerGate
  * [X] Create and view multiple Filecoin Addresses and associate them with PowerGate token.
  * [X] Retrieve Pin (IPFS Hash where front-end deployed) from PinList using Express.js API endpoint that connects to Pinata (http://ethquad.herokuapp.com/api/getWebsiteIPFSHash)
  * [X] Display latest Pin (Website IPFS Hash) in front-end
  * [ ] Modify the Slate's "Make a Storage Deal" code to deploy that latest Pin to Lotus Filecoin Testnet (not just Local)
    * [ ] Pending resolution of issues:
      * https://github.com/filecoin-project/slate/issues/71
      * https://github.com/textileio/powergate/issues/521
      * https://github.com/ltfschoen/ethquad/pull/7
* [X] Frontend deployed to IPFS Address using Pinata SDK
  * [X] Request decentralised domain name from Unstoppable Domains (https://ethquad.crypto)
  * [X] Deployment script generate a new Pin and Unpins all previous (./scripts/pinataUploadIpfs.js)
  * [X] Separate IPFS Address Pin for deployed frontend depending on environment (development or proudction). Used Pinata metadata to identify associated environment.
  * [X] Preview using Official IPFS Gateway (i.e. https://ipfs.io/ipfs/<IPFS_HASH>) in development environment (`yarn dev:ipfs:preview`)
  * [X] Configure ethquad.crypto domain name to redirect to an IPFS Hash (which just redirects to Heroku at ethquad.herokuapp.com), and configure ethquad.herokuapp.com to further redirects to the IPFS hash where the front-end of the website is stored.
    * [X] Temporary workaround since 'Redirect to Traditional Domain' is not working yet (as advised by Magomet Tsanajev from Unstoppable Domains). See https://community.unstoppabledomains.com/t/redirect-blockchain-domains/621
    * [ ] Pending name server changes to propagate https://filecoinproject.slack.com/archives/C016UAP2N8Z/p1594877963245700. Note that this requires Unstoppable Domains to get the 'Redirect to Traditional Domain' functionality working
* [X] Backend Express.js API connection to Infura Eth 2.0 Endpoint (https://altona.infura.io)

### Optional

* [ ] Frontend deployed to IPFS Address using Fleek Continuous Deployment using Github
* [ ] Logo deployed using Fleek Stage App JS SDK (@fleekhq/fleek-cli). See https://docs.fleek.co/storage/fleek-storage-js/
  * [ ] Upload logo to publish it to IPFS, published to DNS, with a CDN and File Compression.
  * [ ] Reference the logo file using the Fleek Storage URL
* [ ] Desktop Fleek Space Daemon integration to share encrypted files privately with peers using Textile/IPFS node on Local Machine
* [ ] Textiles ThreadDB/Buckets (instead of Fleek Space Daemon) since not running private Textile/IPFS node on Local Machine

# Usage

* Go to https://ethquad.herokuapp.com.

Note: Access to https://ethquad.crypto is in progress pending resolution to an IPFS Hash to direct it

# Development

## Install dependencies

* Install dependencies and run server and front-end. Note that Webpack is installed globally to avoid conflicts since it is installed automatically on Heroku and to match the version they use.
```
nvm use;
yarn global add concurrently;
```

## Connect to Lotus (Filecoin) and IPFS

* Download and run Docker
* Clone https://github.com/textileio/powergate
* Run
```
cd docker
make localnet
```

## Develop website locally without deployment to IPFS

```
yarn dev
```

* Go to http://localhost:3000

## Preview website redirecting to deployed to IPFS

```
yarn dev:ipfs:preview
```

* Go to http://localhost:5000
  * Important note: Use port 5000 since only running from server instead of client with proxy.
  * Important: If the UI doesn't load, try running with `yarn dev` instead, since it may be caused by React.js that aren't being shown.

### View information about the ethquad.crypto domain name (provided by [Unstoppable Domains](https://unstoppabledomains.com/r/ce60aaca281f4ce))

```
node ./scripts/unstoppableDomainsRedirect.js
```

# Deployment (IPFS & Heroku)

Generate an IPFS Hash (for redirecting the ethquad.crypto domain name to a traditional domain). Repeat this in future if the traditional domain name (i.e. ethquad.herokuapp.com) changes.

Verify that the IPFS Hash has been created with name 'EthQuad-prod-traditional' at https://pinata.cloud/pinexplorer

Go to https://unstoppabledomains.com/manage and change the IPFS Hash value the new IPFS Hash that is output to the terminal. Check for when the .crypto domain name resolves to the new IPFS Hash by running `node ./scripts/unstoppableDomainsRedirect.js` (without any flags). It will redirect when a value is output for `Read record of IPFS redirection hash:`.

Alternatively try setting the IPFS Hash programmatically by running `node ./scripts/unstoppableDomainsRedirect.js --setRedirectIpfs`. However, this approach would require you to add the following to your .env file:
* `ETHEREUM_ADDRESS` that owns the .crypto domain name
* `MNEMONIC` phrase associate with the above Ethereum address
* `INFURA_PROJECT_ID` and `INFURA_PROJECT_SECRET` to connect to Ethereum Mainnet using Infura
Note that running `node ./scripts/unstoppableDomainsRedirect.js --setRedirectTraditionalDomain` to redirect the .crypto address to a Traditional Domain like https://ethquad.herokuapp.com directly is not currently supported by Unstoppable Domains.

```
yarn run build:release:ipfs-traditional-domain
```

Push changes to IPFS & Heroku
```
git push heroku master
```

Note: Heroku will build dependencies, then run the "heroku-postbuild" script in package.json. The "build:release:ipfs" script will deploy the front-end to an IPFS hash.

Set Heroku Environment Variables to match the contents of the .env file. Replace missing values below:
```
heroku config:set \
  KEY1=VALUE \
  KEY2=VALUE

heroku config
```

# Troubeshooting

If you get a `nodemon` issue due to server already running on a port just run `ps -ef | grep node` and kill all associated processes `kill -9 <PID>`

# Maintenance

[MAINTENANCE.md](./MAINTENANCE.md)

# References

[REFERENCES.md](./REFERENCES.md)
