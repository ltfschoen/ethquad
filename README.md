# About

HackFS team https://hack.ethglobal.co/hackfs/teams/recpspjxSRMexZJVg/recHa78c3edbmDkFu

## Roadmap

* [X] Frontend React.js & TypeScript boilerplate (./client)
* [X] Backend Express.js API boilerplate (./server). Served at https://ethquad.herokuapp.com/api
* [X] Local Docker container setup process for running with Textile.io storage API (PowerGate) that interacts with Lotus (Filecoin) and IPFS
* [ ] Production Docker container running with Textile.io storage API (PowerGate) that interacts with Lotus (Filecoin) and IPFS
* [X] Frontend Slate Design System UI components that interact with PowerGate (./client/src/)
  * [X] Generate a Powergate token. Store or retrieve (if exists) from web browser Local Storage. Check if retrieved existing Powergate token invalid due to restarting local Docker container with Textile PowerGate
  * [X] Create and view multiple Filecoin Addresses and associate them with PowerGate token.
* [X] Frontend deployed to IPFS Address using Pinata SDK
  * [X] Request decentralised domain name from Unstoppable Domains (https://ethquad.crypto)
  * [X] Deployment script generate a new Pin and Unpins all previous (./scripts/pinataUploadIpfs.js)
  * [X] Preview using Official IPFS Gateway (i.e. https://ipfs.io/ipfs/<IPFS_HASH>) in development environment (`yarn dev:ipfs:preview`)
  * [ ] Configure domain name to redirect to Heroku (where it further redirects to the IPFS hash)
    * Pending assistance from Slack group #hfs-sponsor-unstoppable-team https://filecoinproject.slack.com/archives/C016UAP2N8Z/p1594788644226200
* [ ] Frontend deployed to IPFS Address using Fleek Continuous Deployment using Github
* [ ] Logo deployed using Fleek Stage App JS SDK (@fleekhq/fleek-cli). See https://docs.fleek.co/storage/fleek-storage-js/
  * [ ] Upload logo to publish it to IPFS, published to DNS, with a CDN and File Compression.
  * [ ] Reference the logo file using the Fleek Storage URL
* [ ] Desktop Fleek Space Daemon integration to share encrypted files privately with peers using Textile/IPFS node on Local Machine
* [ ] Textiles ThreadDB/Buckets (instead of Fleek Space Daemon) since not running private Textile/IPFS node on Local Machine

# Usage

* Go to https://ethquad.herokuapp.com.

Note: Access to https://ethquad.crypto is in progress

# Development

## Install dependencies

* Install dependencies and run server and front-end. Note that Webpack is installed globally to avoid conflicts since it is installed automatically on Heroku and to match the version they use.
```
nvm use;
yarn global add concurrently webpack@^4.42.0;
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

# Deployment (Heroku)

Push changes to Heroku
```
git push heroku master
```

Note: Heroku will build dependencies, then run the "heroku-postbuild" script in package.json

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
