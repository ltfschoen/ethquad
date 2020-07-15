# About

WIP:
* Integrates Slate, Textile, and PowerGate API to connect to Lotus (Filecoin) and IPFS.
* Decentralised domain provided by Unstoppable Domains at https://ethquad.crypto, which redirects to Herokuapp https://ethquad.herokuapp.com, which redirects to latest IPFS hash the front-end was deployed using the Pinata SDK.

HackFS team https://hack.ethglobal.co/hackfs/teams/recpspjxSRMexZJVg/recHa78c3edbmDkFu

# Usage

* Go to https://ethquad.herokuapp.com.

In future go to https://ethquad.crypto (PENDING AVAILABILITY)

# Development

* Install dependencies and run server and front-end. Note that Webpack is installed globally to avoid conflicts since it is installed automatically on Heroku.
```
nvm use;
yarn global add nodemon concurrently webpack@^4.42.0;
DEBUG=app yarn dev;
```

* Download and run Docker
* Clone https://github.com/textileio/powergate
* Run
```
cd docker
make localnet
```

* Go to http://localhost:3000

# Maintenance

## Deploy (Heroku)

```
heroku login
heroku apps:create ethquad
```

```
git push -f heroku master
```

Set Heroku Environment Variables to match the contents of the .env file. Replace missing values below:
```
heroku config:set \
  KEY=VALUE
```

Open the production website
```
heroku open
```

## Debug

```
heroku ps:scale web=1:free
heroku ps:scale web=2:standard-2x
heroku ps
heroku open
heroku logs --tail
heroku restart
heroku ps:stop web
```

# References

* Eth 2.0
  * Specs https://github.com/ethereum/eth2.0-specs
  * Detailed spec https://github.com/ethereum/eth2.0-specs/blob/dev/ssz/simple-serialize.md
  * Human version https://hackmd.io/Zc8wlp_LRfChQ6TyLC1kxA#Eth1
  * Human version covering core parts of the spec https://benjaminion.xyz/eth2-annotated-spec/phase0/beacon-chain/
  * Human version "Phase 0 for Humans [v0.10.0]" https://notes.ethereum.org/@djrtwo/Bkn3zpwxB
  * Slides slides by hwwhww there: https://docs.google.com/presentation/d/1JlQ8fVZUvt7ywRcI7mj1ExmPxcNII2xKT4lkgnkq7gU/edit#slide=id.g52948b393d_5_1067

* Textile, Slate, and Powergate
  * [Building an App with Filecoin from scratch - using Slate Components & Powergate](https://www.youtube.com/watch?v=FJjPMKRy8xQ)
  * https://slate.host/experiences/generate-powergate-token
  * https://github.com/textileio/lotus-devnet
  * https://github.com/textileio/powergate#localnet-mode
  * https://github.com/textileio/js-powergate-client
  * https://github.com/jimmylee/next-postgres-sequelize
  * https://github.com/filecoin-project/slate

* Pinata
  * Explorer https://pinata.cloud/pinexplorer
  * SDK https://github.com/PinataCloud/Pinata-SDK
  * https://github.com/polkadot-js/apps

* Unstoppable Domains
  * https://unstoppabledomains.com/manage?domain=ethquad.crypto

* Other
  * https://hackernoon.com/how-to-take-advantage-of-local-storage-in-your-react-projects-a895f2b2d3f2