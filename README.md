---
ETHQUAD
---

# Table of Contents
  * [HackFS Hackathon Integration](#chapter-0)
  * [Sia + Namebase (Handshake) "Own the Internet" Hackathon Integration](#chapter-1)

# HackFS Hackathon Integration <a id="chapter-0"></a>

* HackFS Hackathon team https://hack.ethglobal.co/hackfs/teams/recpspjxSRMexZJVg/recHa78c3edbmDkFu

## Roadmap

### HackFS

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
  * [X] Use Slate's "Make a Storage Deal" code to deploy a zip file of the website to Lotus Filecoin Testnet. Only works in 'development' environment where Lotus Filecoin Testnet and PowerGate Docker instances are running (see section "Connect to Lotus (Filecoin) and IPFS" below)
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

#### Optional

* [ ] Frontend deployed to IPFS Address using Fleek Continuous Deployment using Github
* [ ] Logo deployed using Fleek Stage App JS SDK (@fleekhq/fleek-cli). See https://docs.fleek.co/storage/fleek-storage-js/
  * [ ] Upload logo to publish it to IPFS, published to DNS, with a CDN and File Compression.
  * [ ] Reference the logo file using the Fleek Storage URL
* [ ] Desktop Fleek Space Daemon integration to share encrypted files privately with peers using Textile/IPFS node on Local Machine
* [ ] Textiles ThreadDB/Buckets (instead of Fleek Space Daemon) since not running private Textile/IPFS node on Local Machine

## Usage

* Go to https://ethquad.herokuapp.com.

Note: Access to https://ethquad.crypto is in progress pending resolution to an IPFS Hash to direct it
Note: Pending resolution of this issue https://github.com/ltfschoen/ethquad/issues/15

## Development

### Install dependencies

* Install dependencies and run server and front-end. Note that Webpack is installed globally to avoid conflicts since it is installed automatically on Heroku and to match the version they use.
```
nvm use;
yarn global add concurrently;
```

### Connect to Lotus (Filecoin) and IPFS

* Download and run Docker
* Clone https://github.com/textileio/powergate
* Connect to Lotus Filecoin
  * "Local" Testnet
    ```
    cd powergate/docker
    make localnet
    ```
  * Testnet https://github.com/textileio/powergate/blob/master/docker/Makefile
    ```
    cd powergate/docker 
    make up
    ```

### Develop website locally without deployment to IPFS

* IMPORTANT: Wait until PowerGate is fully running before running this.
```
yarn dev
```

* Go to http://localhost:4000 (since Prometheus runs on port 3000)

### Preview website redirecting to deployed to IPFS

```
yarn dev:ipfs:preview   
```

* Go to http://localhost:5000
  * Important note: Use port 5000 since only running from server instead of client with proxy.
  * Important: If the UI doesn't load, try running with `yarn dev` instead, since it may be caused by React.js that aren't being shown.

#### View information about the ethquad.crypto domain name (provided by [Unstoppable Domains](https://unstoppabledomains.com/r/ce60aaca281f4ce))

```
node ./scripts/unstoppableDomainsRedirect.js
```

## Deployment (IPFS & Heroku)

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

Configure Heroku
```
heroku git:remote -a ethquad
```

Set Heroku Environment Variables to match the contents of the .env file. Replace missing values below:
```
heroku config:set \
  KEY1=VALUE \
  KEY2=VALUE

heroku config --app ethquad
```

## Troubeshooting

If you get a `nodemon` issue due to server already running on a port just run `ps -ef | grep node` and kill all associated processes `kill -9 <PID>`

## Maintenance

[MAINTENANCE.md](./MAINTENANCE.md)

## References

[REFERENCES.md](./REFERENCES.md)

# Sia + Namebase (Handshake) "Own the Internet" Hackathon Integration <a id="chapter-1"></a>

## About Sia + Namebase (Handshake)

https://gitcoin.co/hackathon/own-the-internet

* Goal:
  * Build a Skapp using Handshake and Skynet

* Skynet
  * About
    * Offers decentralized filesharing and application hosting where the user owns the content instead of it being controled be a centralized entity (e.g. Youtube, Medium)
    * Applications hosted on Skynet are decentralized apps called "skapps"
  * Usage
    * Create application
    * Upload files or applications to Skynet so file available to all Portals
    * Skylink returned may be downloaded and content viewed through any Portal
    * Runs in browser supporting client-side applications
  * Development
    * API for web apps to upload and download data
    * SDKs supported (JS, Node.js, etc)
    * Build a Skynet Application
      * Instal Node.js, Webpack
      * Install skynet.js NPM package
  * Hosting
    * Portals may be run using Docker
      * Github: https://github.com/NebulousLabs/skynet-webportal
      * Requirements: 8Gb RAM, SSD
      * Portals Ranked: https://siastats.info/skynet_stats
      * Portal Examples (e.g. siasky.net, skyportal.xyz)

* Handshake
  * Skynet Portals run Handshake Full Nodes
    * Endpoints allow users to load applications and content from Handshake domains and query Handshake domains for Skynet content

* Examples
  * Skybin
  * Skylive - skylive.coolhd.hu
  * Instasky - Upload and share media libraries
  * iOS Uploader - Download on phone and share via Skynet
  * Dgit - dgit.dev - decentralized Git
  * SkyGallery - creates media galleries
  * hns.to

* Docs:
  * Skynet Node.js - https://nebulouslabs.github.io/skynet-docs/?javascript#introduction

## Roadmap

### Sia + Namebase (Handshake) "Own the Internet" Hackathon

* [X] Upload a Redirection page file to Skynet hash (Skylink) using the Skynet Node.js SDK. The Skylink of the Redirection page redirects to a given Handshake Domain Name (e.g. epiphysitis/) at a Skynet Portal (e.g. https://siasky.net/hns/epiphysitis/).
  * [X] Issue raised https://github.com/NebulousLabs/nodejs-skynet/issues/47
* [X] Upload Website folder to a different Skylink using the Skynet Node.js SDK. Configure the Handshake Domain Name's DNS records to resolve to that Skylink
  * [X] Issue raised https://github.com/NebulousLabs/nodejs-skynet/issues/48

## Usage 

### Deploy Redirect using Sia Skynet and Handshake

Connect to Lotus (Filecoin) and IPFS (see section "Connect to Lotus (Filecoin) and IPFS")

Add your Handshake (HNS) Domain `HNS_DOMAIN` to the .env file (e.g. `HNS_DOMAIN=epiphysitis`)

Build the website for Development or Production. If Development is chosen the backend API is expected to be running on localhost:5000/api instead of at https://ethquad.herokuapp.com/api.

* IMPORTANT: If using PowerGate, wait until it is fully running before running the following.

* Development (without Skylink deployment)
  ```bash
  yarn dev
  ```
  * Go to http://localhost:4000 (since Prometheus runs on port 3000)

* Development (using Skynet)
  ```bash
  yarn dev:build:sia-handlebars
  ```

* Production (using Skynet)
  ```bash
  yarn build:release:sia-handlebars
  ```

When using Skynet will run the following:
* Create Sia Skynet Handshake URL. 
* Store copy of deployed Skylink Redirection page in ./client/build/skynet/index.html
  * e.g. https://siasky.net/AAA2EiWgmyhNEE-7oNuDSvsP2aH6evDhX9V2NGI7_iKNcw
* Store its Skylink in ./skylink-redirect.txt 
* Deploy latest ./client/build/ folder to Skylink Website page.
  * e.g. https://siasky.net/_B0uyyllCXACSXT66G4Rd7dQu_HN9XZiPRB3IYIQVuC-IQ/index.html
* Store its Skylink in ./skylink-website.txt

Run the server
```bash
yarn dev:server:sia-handlebars
```

Go to https://siasky.net/<SKYLINK_WEBSITE>

Run the following to:
* Set Namebase's Handshake DNS records of the Handshake domain using Namebase API
Update `NAMEBASE_ACCESS_KEY` and `NAMEBASE_SECRET_KEY` in .env according to https://learn.namebase.io/advanced-topics/setting-dns-records#get-namebase-api-key so that it resolves to index.html file in the website folder at the Skylink that was recorded in ./skylink-website.txt

```bash
PUT=true node ./scripts/handshakeDomainSetSkynetPortalRecord.js
```

Alternatvely, manually update the Handshake domain's DNS records by going to https://www.namebase.io/domain-manager/<HANDSHAKE_DOMAIN_NAME> and adding a TXT record that points the domain to the Skylink of the Website <SKYLINK_WEBSITE>/index.html, and then waiting ~10 minutes for domain changes to propagate through Handshake nodes syncing the changes. If you change the NS record too it may take more than a day for changes to propagate.

Verify the Handshake domain's resolve configuration has been updated by either:
* Running `node ./scripts/handshakeDomainSetSkynetPortalRecord.js`.
  * Check that `upToDate` value has changef to `true`
* Check resolution response at these pages:
  * https://siasky.net/hnsres/epiphysitis/
  * https://siasky.net/hns/epiphysitis/
* Check response by entering your Handshake domain name as a query (e.g. "epiphysitis") at this page:
  * https://hns.to/
* Note: The Blockchain DNS Records should update immediately here https://www.namebase.io/domain-manager/epiphysitis/, but it is necessary to wait for the changes to propagate.

## References:

* API docs
  * https://github.com/namebasehq/api-documentation
* Set Handshake DNS
  * https://learn.namebase.io/advanced-topics/setting-dns-records#using-the-script
  * https://learn.namebase.io/advanced-topics/setting-dns-records#connecting-to-skynet
* Verify Skylink record updated in Handshake Domain DNS Records: https://blog.sia.tech/skynet-handshake-d5d16e6b632f
* View Handshake Transaction History: https://hnscan.com
