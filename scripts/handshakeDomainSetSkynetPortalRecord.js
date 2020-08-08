require('dotenv').config()
const fs = require('fs');
const path = require('path');
const { execute } = require('../helpers/execute');

const PATH_PROJECT_ROOT = path.join(__dirname, '..');
const WOPTS = { encoding: 'utf8', flag: 'r' };

const getSkylink = () => {
  const filePath = `${PATH_PROJECT_ROOT}/skylink.txt`;
  const data = fs.readFileSync(filePath, WOPTS);

  return data
}

async function main() {
  const skylink = getSkylink();
  console.log('Skylink is: ', skylink);
  console.log(`Handshake domain name: ${process.env.HNS_DOMAIN}/`)

  // Authorization using Namebase's API to connect to Namebase.io Nameservers
  console.log("Authorizing using Namebase's API...");
  execute(`node ./scripts/namebaseApi.js get blockchain ${process.env.HNS_DOMAIN}`);
  console.log("Authorized using Namebase's API to connect to Namebase.io Nameservers");

  // Set Namebase's Handshake DNS records to the Handshake domain using Namebase API
  console.log(`Setting Namebase's Handshake DNS records...`);
  execute(`node ./scripts/namebaseApi.js put blockchain ${process.env.HNS_DOMAIN} \
  '{"records":[{"type":"TXT","host":"","value":"${skylink}/index.html","ttl":0},{"type":"NS","host":"ns1","value":"44.231.6.183","ttl":10800}]}'`);

  console.log(`Set Namebase's Handshake DNS records to the Handshake domain: ${process.env.HNS_DOMAIN}/`);
  console.log('Please wait ~10 minutes for the domain changes to propagate and sync across Handshake nodes');
}

main()
  .catch(console.error)
  .finally(() => process.exit());
