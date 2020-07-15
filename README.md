# About

WIP:
* Integrates Slate, Textile, and PowerGate API to connect to Lotus (Filecoin) and IPFS.
* Decentralised domain provided by Unstoppable Domains at https://ethquad.crypto, which redirects to Herokuapp https://ethquad.herokuapp.com, which redirects to latest IPFS hash the front-end was deployed using the Pinata SDK.
* Express.js API served from https://ethquad.herokuapp.com

HackFS team https://hack.ethglobal.co/hackfs/teams/recpspjxSRMexZJVg/recHa78c3edbmDkFu

# Usage

* Go to https://ethquad.herokuapp.com.

Note: Access to https://ethquad.crypto is in progress

# Development

## Install dependencies

* Install dependencies and run server and front-end. Note that Webpack is installed globally to avoid conflicts since it is installed automatically on Heroku and to match the version they use.
```
nvm use;
yarn global add nodemon concurrently webpack@^4.42.0;
```

## Connect to Lotus (Filecoin) and IPFS

* Download and run Docker
* Clone https://github.com/textileio/powergate
* Run
```
cd docker
make localnet
```

## Develop website locally (with hot reload) without deployment to IPFS

```
yarn dev;
```

* Go to http://localhost:3000

## Preview website redirecting to deployed to IPFS (no hot reload)

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

# Maintenance (Heroku)

[MAINTENANCE.md](./MAINTENANCE.md)

# References

[REFERENCES.md](./REFERENCES.md)
